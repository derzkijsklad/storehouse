package levin.telran.warehouse.aws;

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
import java.util.Map;

public class App {
	
	private static final int TRESHOLD_PERCENT_VALUE = 50;
	private static final int MAX_VALUE = 20;
	private static final String DYNAMO_ORDERS_TABLE_NAME = "spot_lack_data";
	private static final String DEFAULT_LOGGING_LEVEL = "INFO";
	private static final String LOGGER_LEVEL = "LOGGER_LEVEL";
	private static final String RDS_URL = "jdbc:postgresql://warehouse-test.cducya0gc38j.us-east-1.rds.amazonaws.com:5432/warehouse_db";
	private static final String RDS_USERNAME = "postgres";
	private static final String RDS_PASSWORD = "12345.com";
	
	static DynamoDbClient clientDynamo = DynamoDbClient.builder().build();
	static Builder requestInsertLack;
	static Logger logger = Logger.getLogger("orders-transfer");

	public void handleRequest(DynamodbEvent event, Context context) {
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
					putOrderInRDS(spotId, value, timestamp);	
				} else {
					logger.warning(r.getEventName() + " event name but should be INSERT");
				}

			});
		}
	}


	private void putOrderInRDS(String spotId, double value, String timestamp) {
	    try (Connection connection = DriverManager.getConnection(RDS_URL, RDS_USERNAME, RDS_PASSWORD)) {

	        //String sql = "INSERT INTO orders_data (spot_id, number_of_items, timestamp) VALUES (?, ?, ?);";
	    	String sql = "CREATE TABLE cars ("
	    			  + "brand VARCHAR(255),"
	    			 + "model VARCHAR(255),"
	    			  +"year INT)";

	        PreparedStatement preparedStatement = connection.prepareStatement(sql);

//	        Timestamp postgresTimestamp = convertTimestamp(timestamp);
//	        
//	        preparedStatement.setLong(1, Long.parseLong(spotId)); 
//	        preparedStatement.setDouble(2, value); 
//	        preparedStatement.setTimestamp(3, postgresTimestamp); 
	        logger.info(preparedStatement.toString());
	        preparedStatement.executeUpdate();
	    } catch (SQLException e) {
	        e.printStackTrace();
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
//		try {
//			res = Level.parse(levelStr);
//		} catch (Exception e) {
//			logger.warning(levelStr + " wrong logger level take default value " + DEFAULT_LOGGER_LEVEL);
//			res = Level.parse(DEFAULT_LOGGER_LEVEL);
//		}
		return res;
	}


}