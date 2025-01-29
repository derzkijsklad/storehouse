package levin.telran.warehouse;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.util.HashMap;
import java.util.Random;
import java.util.stream.IntStream;

import levin.telran.warehouse.dto.SpotData;

public class SpotDataSender {
	private static final int N_PACKETS = 100;
	private static final long TIMEOUT = 500;
	private static final int N_SPOTS = 5;
	private static final int THRESHOLD_PERCENT_VALUE = 50;
	private static final int MAX_VALUE = 20;
	private static final String HOST = "107.23.133.46";
	private static final int PORT = 5000;
	private static final int INCONSISTENCY_PROB = 30;
	private static final int CHANGE_PROB = 60;
	private static final int DELIVERY_PROB = 20;
	private static final int SPOT_ID_PRINTED_VALUES = 1;
	private static final int SUBTRACTION_MAX_PERCENT = 70;
	private static final int SUBTRACTION_MIN_PERCENT = 10;

	private static Random random = new Random();
	private static HashMap<Long, Integer> spotValues = new HashMap<>();
	static DatagramSocket socket;

	public static void main(String[] args) throws Exception {
		socket = new DatagramSocket();
		IntStream.rangeClosed(1, N_PACKETS).forEach(SpotDataSender::sendData);

	}

	static void sendData(int seqNumber) {
		SpotData data = getRandomSpotData(seqNumber);
		if (data.spotId() == SPOT_ID_PRINTED_VALUES) {
			System.out.printf("Weight on spot %d is %f\n", SPOT_ID_PRINTED_VALUES, data.value());
		}
		String jsonData = data.toString();
		sendDatagramPacket(jsonData);
		try {
			Thread.sleep(TIMEOUT);
		} catch (InterruptedException e) {

		}
	}

	private static void sendDatagramPacket(String jsonData) {
		byte[] buffer = jsonData.getBytes();
		try {
			DatagramPacket packet = new DatagramPacket(buffer, buffer.length, InetAddress.getByName(HOST), PORT);
			socket.send(packet);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}

	}

	private static SpotData getRandomSpotData(int seqNumber) {
		long spotId = random.nextInt(1, N_SPOTS + 1);
		int value = getValue(spotId);

		return new SpotData(seqNumber, spotId, value, System.currentTimeMillis());
	}

	private static int getValue(long spotId) {
		int valueRes = spotValues.computeIfAbsent(spotId,
				k -> random.nextInt((THRESHOLD_PERCENT_VALUE / 100) * MAX_VALUE, MAX_VALUE + 1));

		double threshold = (THRESHOLD_PERCENT_VALUE / 100.0) * MAX_VALUE;
		boolean isDeliveryPossible = spotValues.get(spotId) <= threshold;
		if (chance(CHANGE_PROB)) {
			valueRes = getValueWithChange(valueRes, isDeliveryPossible);
			if(valueRes > 0 && valueRes <= MAX_VALUE){
			spotValues.put(spotId, valueRes);
			}
		}

		return valueRes;
	}

	private static int getValueWithChange(int previousValue, boolean isDeliveryPossible) {
			int res = previousValue;
			if (chance(DELIVERY_PROB) && isDeliveryPossible) {
			res = previousValue + (MAX_VALUE-(THRESHOLD_PERCENT_VALUE*MAX_VALUE)/100) ;	
			}else if(chance(INCONSISTENCY_PROB)){
				res = getIncosistentValue();
			}
		    else{
			int subtractionPercent = random.nextInt(SUBTRACTION_MIN_PERCENT, SUBTRACTION_MAX_PERCENT);
			int subtraction =  (random.nextInt(0, previousValue) * subtractionPercent)/100;
			res = previousValue - subtraction;
			}
			return res;
		}

	private static boolean chance(int prob) {

		return random.nextInt(0, 100) < prob;
	}

    private static int getIncosistentValue() {
		int num1 = random.nextInt(-MAX_VALUE, 0);
		int num2 = random.nextInt(MAX_VALUE, MAX_VALUE*2);
		return random.nextBoolean() ? num1 : num2;
    }

}
