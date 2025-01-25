package warehouse;

import java.util.*;
import java.util.logging.*;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.DynamodbEvent;
import com.amazonaws.services.lambda.runtime.events.DynamodbEvent.DynamodbStreamRecord;

import software.amazon.awssdk.services.dynamodb.model.*;
import software.amazon.awssdk.services.dynamodb.*;

public class App {

    private static final int TRESHOLD_PERCENT_VALUE = 50;
    private static final int MAX_VALUE = 20;
    private static final String ORDERS_TABLE_NAME = "orders_data";
    private static final String DEFAULT_LOGGING_LEVEL = "INFO";
    private static final String LOGGER_LEVEL = "LOGGER_LEVEL";

    static DynamoDbClient clientDynamo = DynamoDbClient.builder().build();
    static PutItemRequest.Builder requestInsertOrder;  // For PUT request
    static Logger logger = Logger.getLogger("create-order");

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

						checkIfOrderNeeded(spotId, value);
                } else {
                    logger.warning(r.getEventName() + " event name but should be INSERT");
                }

            });
        }
    }

    private void checkIfOrderNeeded(String spotId, double value) {
        Double sum = sumOfAlreadyOrdered(spotId);
        double treshold = (TRESHOLD_PERCENT_VALUE * MAX_VALUE) / 100;
        if ((MAX_VALUE - value) + sum <= treshold) {
            putOrder(spotId, value);
        }
    }

    private double sumOfAlreadyOrdered(String spotId) {
		logger.info("sumOfAlreadyOrdered");
		double sum = 0;
        boolean hasResults = false;
		  try {
			Map<String, AttributeValue> expressionValues = new HashMap<>();
			expressionValues.put(":spotId", AttributeValue.builder().n(spotId).build());
			expressionValues.put(":isClosed", AttributeValue.builder().bool(false).build());
			logger.info("after map");
            QueryRequest queryRequest = QueryRequest.builder()
            .tableName(ORDERS_TABLE_NAME)
            .keyConditionExpression("spotId = :spotId") // Only the hash key condition
            .filterExpression("isClosed = :isClosed") // Filter non-key attribute
            .expressionAttributeValues(expressionValues)
            .build();
			logger.info("after queryRequest");
			QueryResponse queryResponse = clientDynamo.query(queryRequest);
			logger.info("response: " + queryResponse.toString());
				for (Map<String, AttributeValue> item : queryResponse.items()) {
					logger.info("for loop in queryResponse");
					
					if (item.containsKey("value")) {
						logger.info("entered sum");
						double value = Double.parseDouble(item.get("value").n()); // Assuming value is a string representation of a number
						sum += value;
						logger.info("sum = " + sum);
						hasResults = true;
					}
				}
				if (hasResults) {
                logger.info("The sum of the values is: " + sum);
            } else {
                logger.info("No records found.");
            }

        } catch (DynamoDbException e) {
            logger.warning("Error: " + e.getMessage());
		}
		return sum;
	}
	

    private void putOrder(String spotId, Double value) {
        Map<String, AttributeValue> itemMap = new HashMap<>();
        itemMap.put("spotId", AttributeValue.builder().n(spotId).build());
        itemMap.put("value", AttributeValue.builder().n(value + "").build());
        itemMap.put("timestamp", AttributeValue.builder().n(String.valueOf(System.currentTimeMillis())).build());
		itemMap.put("isClosed", AttributeValue.builder().bool(false).build());
        clientDynamo.putItem(requestInsertOrder.item(itemMap).build());
        logger.fine(String.format("put in table %s", spotId, value));
    }

    private void requestsSetUp() {
        requestInsertOrder = PutItemRequest.builder()
                .tableName(ORDERS_TABLE_NAME);
        // requestGetOrder = GetItemRequest.builder().tableName(ORDERS_TABLE_NAME);
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
