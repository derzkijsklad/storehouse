package levin.telran.warehouse;

import java.net.*;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.*;

import org.json.JSONObject;

import levin.telran.warehouse.dto.SpotData;

import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest.Builder;


public class ReceiverAppl {
	private static final int PORT = 5000;
	private static final int MAX_BUFFER_SIZE = 1500;
	private static final Level DEFAULT_LOGGING_LEVEL = Level.INFO;
	private static final int TRESHOLD_PERCENT_VALUE = 50;
	private static final int MAX_VALUE = 20;
	private static final String RECEIVED_DATA_TABLE_NAME = "received_data";

	static DatagramSocket socket;
	static DynamoDbClient client = DynamoDbClient.builder().build();
	static Builder request;

	static Logger logger = Logger.getLogger("WeightReceiverAppl");

	public static void main(String[] args) throws Exception {
		request = PutItemRequest.builder().tableName(RECEIVED_DATA_TABLE_NAME);
		setLogger();
		logger.info("DB Table name: " + RECEIVED_DATA_TABLE_NAME);
		socket = new DatagramSocket(PORT);
		logger.info("Server is listening port " + PORT);
		byte[] buffer = new byte[MAX_BUFFER_SIZE];
		while (true) {
			DatagramPacket packet = new DatagramPacket(buffer, MAX_BUFFER_SIZE);
			socket.receive(packet);
			processReceivedData(packet);
		}

	}

	private static void setLogger() {
		LogManager.getLogManager().reset();
		Handler handler = new ConsoleHandler();
		logger.setLevel(DEFAULT_LOGGING_LEVEL);
		handler.setLevel(Level.FINEST);
		logger.addHandler(handler);
	}

	private static Level getLevel() {
		Level level = DEFAULT_LOGGING_LEVEL;
		try {
			level = Level.parse(System.getenv("LOGGING_LEVEL"));

		} catch (IllegalArgumentException e) {
			logger.warning("Illegal level value");
		} catch (NullPointerException e) {
			logger.warning("Level env var not provided, default value is " + level);
		}
		return level;
	}

	private static void processReceivedData(DatagramPacket packet) {
		String json = new String(Arrays.copyOf(packet.getData(), packet.getLength()));
		logger.info(json);
		logger.fine(json);
		SpotData spotData = SpotData.getSpotData(json);
		client.putItem(request.item(getMapItem(spotData)).build());

		logger.finer(String.format("table: %s added item with partition key is %d," + " sorted key is %d",
				RECEIVED_DATA_TABLE_NAME, spotData.spotId(), spotData.timestamp()));
		logAbnormalValue(spotData);

	}

	private static Map<String, AttributeValue> getMapItem(SpotData spotData) {
		HashMap<String, AttributeValue> res = new HashMap<>();
		res.put("spotId", AttributeValue.builder().n(spotData.spotId() + "").build());
		res.put("timestamp", AttributeValue.builder().n(spotData.timestamp() + "").build());
		res.put("value", AttributeValue.builder().n(spotData.value() + "").build());
		return res;
	}

	private static void logAbnormalValue(SpotData spotData) {
	double spotWeightValue = spotData.value();
		if (spotWeightValue < 0 ) {
			logger.severe(String.format("weight on spot %d less than 0",
					spotData.spotId()));
		} else if (spotWeightValue > MAX_VALUE) {
			logger.severe(String.format("weight on spot %d greater than maximum", spotData.spotId()));
		} 

	}

}
