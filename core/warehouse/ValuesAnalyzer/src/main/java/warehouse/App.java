package warehouse;
import java.util.HashMap;
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
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest.Builder;

public class App {
	
	private static final int TRESHOLD_PERCENT_VALUE = 50;
	private static final int MAX_VALUE = 20;
	private static final String LACK_TABLE_NAME = "spot_lack_data";
	private static final String ABNORMAL_TABLE_NAME = "abnormal_data";
	private static final String DEFAULT_LOGGING_LEVEL = "INFO";
	 private static final String LOGGER_LEVEL = "LOGGER_LEVEL";

	
	static DynamoDbClient clientDynamo = DynamoDbClient.builder().build();
	static Builder requestInsertLack;
	static Builder requestInsertAbnormal;
	static Logger logger = Logger.getLogger("lack-detector");

	public void handleRequest(DynamodbEvent event, Context context) {
		loggerSetUp();
		requestsSetUp();
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
					logger.finer(String.format("Received: record with spotId=%s, value=%f, timestamp=%s",
							spotId, value, timestamp));
						
					analyzeValue(spotId, value);
				} else {
					logger.warning(r.getEventName() + " event name but should be INSERT");
				}

			});
		}
	}

	private void analyzeValue(String spotId, double value) {
		double treshold = (TRESHOLD_PERCENT_VALUE*MAX_VALUE)/100;
		if((value > MAX_VALUE ) || (value < 0)) {
			putValue(spotId, value, true);
		}else if(value <= treshold) {
			putValue(spotId, MAX_VALUE - value,false);
		}
	}

	private void putValue(String spotId, Double value, boolean isAbnormal) {
		Map<String, AttributeValue> itemMap = new HashMap<>();
		itemMap.put("spotId", AttributeValue.builder().n(spotId).build());
		itemMap.put("value", AttributeValue.builder().n(value + "").build());
		itemMap.put("timestamp", AttributeValue.builder().n(String.valueOf(System.currentTimeMillis())).build());

		if (isAbnormal) {
			clientDynamo.putItem(requestInsertAbnormal.item(itemMap).build());
			logger.fine(String.format("put abnormal value  %f for spot %s  in table", value, spotId));
		} else {
			clientDynamo.putItem(requestInsertLack.item(itemMap).build());
			logger.fine(String.format("put lack value  %f for spot %s  in table", value, spotId));
		}
		
	}

	
	private void requestsSetUp() {
		requestInsertLack = PutItemRequest.builder()
				.tableName(LACK_TABLE_NAME);
		requestInsertAbnormal = PutItemRequest.builder()
				.tableName(ABNORMAL_TABLE_NAME);
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