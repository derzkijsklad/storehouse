package warehouse;

import java.util.*;
import java.util.logging.*;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.DynamodbEvent;
import com.amazonaws.services.lambda.runtime.events.DynamodbEvent.DynamodbStreamRecord;

import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.*;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest.Builder;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.sql.Statement;
import java.sql.ResultSet;

public class App {
    
    private static final int TRESHOLD_PERCENT_VALUE = 50;
    private static final int MAX_VALUE = 20;
    private static final String DYNAMO_ORDERS_TABLE_NAME = "spot_lack_data";
    private static final String DEFAULT_LOGGING_LEVEL = "INFO";
    private static final String LOGGER_LEVEL = "LOGGER_LEVEL";
    
    static DynamoDbClient clientDynamo = DynamoDbClient.builder().build();
    static Builder requestInsertLack;
    static Logger logger = Logger.getLogger("orders-transfer");

    public void handleRequest(DynamodbEvent event, Context context) {
        String dbEndpoint = System.getenv("RDS_HOST");
        String dbUsername = System.getenv("RDS_USERNAME");
        String dbPassword = System.getenv("RDS_PASSWORD");
        String dbName = System.getenv("RDS_DB_NAME");

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
                    putOrderInRDS(dbEndpoint, dbUsername, dbPassword, dbName, spotId, value, timestamp);    
                } else {
                    logger.warning(r.getEventName() + " event name but should be INSERT");
                }

            });
        }
    }

    private void putOrderInRDS(String dbEndpoint, String dbUsername, String dbPassword, String dbName, String spotId, double value, String timestamp) {
        String RDSconnectionString = String.format("jdbc:postgresql://%s:5432/%s", dbEndpoint, dbName);

        try (Connection connection = DriverManager.getConnection(RDSconnectionString, dbUsername, dbPassword)) {

            // Check if the table exists
			logger.info("checkiftableexists");
            if (!checkIfTableExists(connection, "orders_data")) {
                createTable(connection);
            }

            // Insert data into the table
            String sql = "INSERT INTO orders_data (spot_id, value, timestamp, is_closed) VALUES (?, ?, ?, false);";
            PreparedStatement preparedStatement = connection.prepareStatement(sql);

            Timestamp postgresTimestamp = convertTimestamp(timestamp);
            preparedStatement.setLong(1, Long.parseLong(spotId)); 
            preparedStatement.setDouble(2, value); 
            preparedStatement.setTimestamp(3, postgresTimestamp); 
            logger.info(preparedStatement.toString());
            preparedStatement.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private boolean checkIfTableExists(Connection connection, String tableName) throws SQLException {
        String checkTableSQL = "SELECT * FROM information_schema.tables WHERE table_name = '" + tableName + "';";
        try (Statement stmt = connection.createStatement()) {
            ResultSet rs = stmt.executeQuery(checkTableSQL);
            return rs.next();  // If table exists, rs.next() will return true
        }
    }

    private void createTable(Connection connection) throws SQLException {
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
            long timestampLong = Long.parseLong(timestamp); // Convert string to long (Unix timestamp)
            postgresTimestamp = new Timestamp(timestampLong); // Convert to PostgreSQL Timestamp
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
