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

    private static final int TRESHOLD_PERCENT_VALUE = 50;
    private static final int MAX_VALUE = 20;
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
            logger.severe("no records in the event");
        } else {
            records.forEach(r -> {
                Map<String, com.amazonaws.services.lambda.runtime.events.models.dynamodb.AttributeValue> map = r
                        .getDynamodb().getNewImage();
                if (map == null) {
                    logger.warning("No new image found");
                } else if (r.getEventName().equals("INSERT")) {
                    String spotId = map.get("spotId").getN();
                    double value = Double.parseDouble(map.get("value").getN());
                    String timestamp = map.get("timestamp").getN();
                    logger.info(String.format("Received: record with spotId=%s, value=%f, timestamp=%s",
                            spotId, value, timestamp));
                    try {
                        putOrderInRDS(connection, spotId, value, timestamp);
                    } catch (SQLException e) {

                        e.printStackTrace();
                    }
                } else {
                    logger.warning(r.getEventName() + " event name but should be INSERT");
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
        logger.info(tableIsCreated + " - is table createdsam");
    }

    private void putOrderInRDS(Connection connection, String spotId, double value, String timestamp)
            throws SQLException {

        String sql = "INSERT INTO orders_data (spot_id, value, timestamp, is_closed) VALUES (?, ?, ?, false);";
        PreparedStatement preparedStatement = connection.prepareStatement(sql);
        Timestamp postgresTimestamp = convertTimestamp(timestamp);
        preparedStatement.setLong(1, Long.parseLong(spotId));
        preparedStatement.setDouble(2, value);
        preparedStatement.setTimestamp(3, postgresTimestamp);
        logger.info(preparedStatement.toString());
        preparedStatement.executeUpdate();

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
