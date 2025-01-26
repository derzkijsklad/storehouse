package warehouse;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.logging.ConsoleHandler;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.LogManager;
import java.util.logging.Logger;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.DynamodbEvent;
import com.amazonaws.services.lambda.runtime.events.DynamodbEvent.DynamodbStreamRecord;

import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest.Builder;

public class App {

    private static final String DYNAMO_ORDERS_TABLE_NAME = "spot_lack_data";
    private static final String DEFAULT_LOGGING_LEVEL = "INFO";
    private static final String LOGGER_LEVEL = "LOGGER_LEVEL";

    static DynamoDbClient clientDynamo = DynamoDbClient.builder().build();
    static Builder requestInsertLack;
    static Logger logger = Logger.getLogger("orders-transfer");
    static Connection connection;
    boolean tableIsCreated = false;

    public void handleRequest(DynamodbEvent event, Context context) throws SQLException {
        if (connection == null) {
            try {
                initConnection();
            } catch (SQLException ex) {
            }
        }
        if (tableIsCreated == false) {
            logger.info("create table start");
            createTable(connection);
        }
        loggerSetUp();
        requestsSetUp();
        logger.info(event.toString());
        List<DynamodbStreamRecord> records = event.getRecords();
        if (records == null) {
            logger.severe("No records in the event");
        } else {
        records.forEach(r -> {
            Map<String, com.amazonaws.services.lambda.runtime.events.models.dynamodb.AttributeValue> map = r
                    .getDynamodb().getNewImage();
            if (map == null) {
                logger.warning("No new image found");
            } else {
                String spotId = map.get("spotId").getN();
                double value = Double.parseDouble(map.get("value").getN());
                String timestamp = map.get("timestamp").getN();
                logger.info(String.format("Received: record with spotId=%s, value=%f, timestamp=%s",
                        spotId, value, timestamp));

                // Handle INSERT event
                if (r.getEventName().equals("INSERT")) {
                    try {
                        putOrderInRDS(connection, spotId, value, timestamp, false);
                    } catch (SQLException e) {
                        logger.severe("Error inserting order: " + e.getMessage());
                    }
                }
                // Handle MODIFY event
                else if (r.getEventName().equals("MODIFY")) {
                    try {
                        modifyOrderInRDS(connection, r, spotId, timestamp);
                    } catch (SQLException e) {
                        logger.severe("Error modifying order: " + e.getMessage());
                    }
                } else {
                    logger.warning(r.getEventName() + " event name, expected INSERT or MODIFY");
                }
            }
        });
    }
}


    private void initConnection() throws SQLException {
        String dbEndpoint = System.getenv("RDS_HOST");
        String dbUsername = System.getenv("RDS_USERNAME");
        String dbPassword = System.getenv("RDS_PASSWORD");
        String dbName = System.getenv("RDS_DB_NAME");
        String tableName = System.getenv("RDS_TABLE_NAME");
        String RDSconnectionString = String.format("jdbc:postgresql://%s:5432/%s", dbEndpoint, dbName);
        connection = DriverManager.getConnection(RDSconnectionString, dbUsername, dbPassword);
        tableIsCreated = checkIfTableExists(connection, tableName);
        logger.info(tableIsCreated + " - is table created");
    }

    private void putOrderInRDS(Connection connection, String spotId, double value, String timestamp, boolean isClosed)
            throws SQLException {

        String sql = "INSERT INTO orders_data (spot_id, value, timestamp, is_closed) VALUES (?, ?, ?, ?);";
        PreparedStatement preparedStatement = connection.prepareStatement(sql);
        Timestamp postgresTimestamp = convertTimestamp(timestamp);
        preparedStatement.setLong(1, Long.parseLong(spotId));
        preparedStatement.setDouble(2, value);
        preparedStatement.setTimestamp(3, postgresTimestamp);
        preparedStatement.setBoolean(4, isClosed);
        logger.info("PreparedStatement: " + preparedStatement.toString());
        preparedStatement.executeUpdate();
    }

    private void modifyOrderInRDS(Connection connection, DynamodbStreamRecord r, String spotId, String timestamp)
        throws SQLException {

    // Access the 'newImage' from the record 'r' to check for changes
    boolean isClosed = false;
    Map<String, com.amazonaws.services.lambda.runtime.events.models.dynamodb.AttributeValue> newImage = r.getDynamodb().getNewImage();

    // Check if the 'isClosed' field exists in the new image, and if so, get its value
    if (newImage != null && newImage.containsKey("isClosed")) {
        isClosed = newImage.get("isClosed").getBOOL();
    } else {
        logger.warning("No 'isClosed' field found in the new image.");
    }

    // Prepare the UPDATE SQL query
 String sql = "UPDATE orders_data SET is_closed = ? WHERE spot_id = ? AND timestamp = ?;";


    // Log the details to help debug
    logger.info(String.format("Updating record with spotId=%s, timestamp=%s, isClosed=%b", spotId, timestamp, isClosed));

    // Create the PreparedStatement
    PreparedStatement preparedStatement = connection.prepareStatement(sql);
    Timestamp postgresTimestamp = convertTimestamp(timestamp);

    // Set the parameters for the UPDATE query
   preparedStatement.setBoolean(1, isClosed);           // Set the new is_closed value
        preparedStatement.setLong(2, Long.parseLong(spotId)); // Set spot_id for the WHERE clause
        preparedStatement.setTimestamp(3, postgresTimestamp);

    // Log the prepared statement for debugging
    logger.info("PreparedStatement for MODIFY event: " + preparedStatement.toString());

    // Execute the update query
    int rowsUpdated = preparedStatement.executeUpdate();
    
    // Log how many rows were updated
    if (rowsUpdated == 0) {
        logger.warning("No rows were updated. This may indicate that the spotId did not match any existing rows.");
    } else {
        logger.info(String.format("Successfully updated %d row(s).", rowsUpdated));
    }
}


    private boolean checkIfTableExists(Connection connection, String tableName) throws SQLException {
        DatabaseMetaData meta = connection.getMetaData();
        logger.info("checking if table exists");
        ResultSet resultSet = meta.getTables(null, null, tableName, new String[] { "TABLE" });
        logger.info("checking if table exists - end");
        return resultSet.next();
    }

    private void createTable(Connection connection) throws SQLException {
        logger.info("create table method");
        String createTableSQL = "CREATE TABLE orders_data ("
                + "id SERIAL PRIMARY KEY, "
                + "spot_id BIGINT NOT NULL, "
                + "value DOUBLE PRECISION, "
                + "timestamp TIMESTAMP, "
                + "is_closed BOOLEAN DEFAULT FALSE"
                + ");";

        try (Statement stmt = connection.createStatement()) {
            stmt.executeUpdate(createTableSQL);
            logger.info("Table 'orders_data' created.");
        }
    }

    private Timestamp convertTimestamp(String timestamp) {
        Timestamp postgresTimestamp = null;
        try {
            long timestampLong = Long.parseLong(timestamp);
            postgresTimestamp = new Timestamp(timestampLong);
        } catch (NumberFormatException e) {
            logger.warning("Invalid timestamp format: " + timestamp);
        }
        return postgresTimestamp;
    }

    private void requestsSetUp() {
        requestInsertLack = PutItemRequest.builder()
                .tableName(DYNAMO_ORDERS_TABLE_NAME);
    }

    private static void loggerSetUp() {
        Level loggerLevel = getLoggerLevel();
        LogManager.getLogManager().reset();
        Handler handler = new ConsoleHandler();
        logger.setLevel(loggerLevel);
        handler.setLevel(Level.FINEST);
        logger.addHandler(handler);
        logger.config("logger level is " + loggerLevel);
    }

    private static Level getLoggerLevel() {
        String levelStr = System.getenv().getOrDefault(LOGGER_LEVEL, DEFAULT_LOGGING_LEVEL);
        Level res = Level.parse(levelStr);
        return res;
    }
}
