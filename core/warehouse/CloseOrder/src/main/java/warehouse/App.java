package warehouse;

import java.util.*;
import java.util.logging.*;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.DynamodbEvent;

import software.amazon.awssdk.services.dynamodb.model.*;
import software.amazon.awssdk.services.dynamodb.*;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest.Builder;


public class App {
    private static final int TRESHOLD_PERCENT_VALUE = 50;
    private static final int MAX_VALUE = 20;
    private static final String ORDERS_TABLE_NAME = "orders_data";
    private static final String DEFAULT_LOGGING_LEVEL = "INFO";
    private static final String LOGGER_LEVEL = "LOGGER_LEVEL";

    static DynamoDbClient clientDynamo = DynamoDbClient.builder().build();
    static Builder requestCloseOrder;
    static Logger logger = Logger.getLogger("close-order");

    public void handleRequest(DynamodbEvent event, Context context) {
        loggerSetUp();
        requestsSetUp();
        var records = event.getRecords();
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
                    checkIfNeedToClose(spotId, value);
                    logger.info("checkIfNeedToClose");
                } else {
                    logger.warning(r.getEventName() + " event name but should be INSERT");
                }

            });
        }
    }

    private void closeOrder(Map<String, AttributeValue> order) {
        // Fetch spotId and timestamp, check for null/empty values
        String spotId = order.get("spotId") != null ? order.get("spotId").n() : null;
        String timestamp = order.get("timestamp") != null ? order.get("timestamp").n() : null;
        
        if (spotId == null)  {
            logger.severe("Error: Missing spotId. Cannot close order.");
            return; // Early return if required fields are missing
        }else if(timestamp == null){
            logger.severe("Error: Missing timestamp. Cannot close order.");
            return; // Early return if required fields are missing
        }
    
        // Log the values to ensure they are correct
        logger.info("Closing order for spotId: " + spotId + " and timestamp: " + timestamp);
    
        // Set expression values for the update
        Map<String, AttributeValue> expressionValues = new HashMap<>();
        expressionValues.put(":isClosed", AttributeValue.builder().bool(true).build()); // Set isClosed to true
    
        // Construct the UpdateItemRequest using both partition key and sort key
        UpdateItemRequest updateRequest = UpdateItemRequest.builder()
            .tableName(ORDERS_TABLE_NAME)
            .key(Map.of(
                "spotId", AttributeValue.builder().n(spotId).build(),   // Partition key
                "timestamp", AttributeValue.builder().n(timestamp).build() // Sort key (timestamp)
            )) 
            .updateExpression("SET isClosed = :isClosed") // Update the isClosed field
            .expressionAttributeValues(expressionValues)
            .build();

            logger.info("Prepared UpdateItemRequest with spotId: " + spotId + " and timestamp: " + timestamp);

    
        try {
            // Update the order by setting isClosed to true
            clientDynamo.updateItem(updateRequest);
            logger.info("Closed order for spotId: " + spotId + " and timestamp: " + timestamp);
        } catch (DynamoDbException e) {
            logger.severe("Error closing order: " + e.getMessage());
        }
    }
    
    
    private void requestsSetUp() {
        requestCloseOrder = PutItemRequest.builder()
                .tableName(ORDERS_TABLE_NAME);
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
        String levelStr = System.getenv()
                .getOrDefault(LOGGER_LEVEL, DEFAULT_LOGGING_LEVEL);
        Level res = null;
        try {
            res = Level.parse(levelStr);
        } catch (Exception e) {
            logger.warning(levelStr + " wrong logger level take default value " + DEFAULT_LOGGING_LEVEL);
            res = Level.parse(DEFAULT_LOGGING_LEVEL);
        }
        return res;
    }

    private void checkIfNeedToClose(String spotId, double value) {
        double treshold = (TRESHOLD_PERCENT_VALUE * MAX_VALUE)/100;

        if (value > treshold) {
            logger.info("value > treshold");
            List<Map<String, AttributeValue>> openOrdersList = getSpotOpenOrders(spotId);
            if (openOrdersList.isEmpty()) {
                logger.info("No open orders found for spotId: " + spotId);
                return;
            }
            for (Map<String, AttributeValue> order : openOrdersList) {
                logger.info("closeOrder initiation");
                closeOrder(order);
            }
        }
    }

    private List<Map<String, AttributeValue>> getSpotOpenOrders(String spotId) {
        List<Map<String, AttributeValue>> orders = new ArrayList<>();

        Map<String, AttributeValue> expressionValues = new HashMap<>();
        logger.info(spotId);
        expressionValues.put(":spotId", AttributeValue.builder().n(spotId).build());
        expressionValues.put(":isClosed", AttributeValue.builder().bool(false).build());

        QueryRequest queryRequest = QueryRequest.builder()
                .tableName(ORDERS_TABLE_NAME)
                .keyConditionExpression("spotId = :spotId")
                .filterExpression("isClosed = :isClosed")
                .expressionAttributeValues(expressionValues)
                .build();

        try {
            QueryResponse queryResponse = clientDynamo.query(queryRequest);

            orders = queryResponse.items();
            logger.info("Found " + orders.size() + " open orders (isClosed = false) for spotId: " + spotId);
        } catch (DynamoDbException e) {
            logger.warning("Error querying orders: " + e.getMessage());
        }

        return orders;
    }
}
