package levin.telran.warehouse.dto;

import org.json.JSONObject;

public record SpotData(long seqNumber, long spotId, double value, long timestamp) {
	public static SpotData getSpotData(String json){
		JSONObject jsonObj = new JSONObject(json);
		return new SpotData(jsonObj.getLong("seqNumber"),
				jsonObj.getLong("spotId"),
				jsonObj.getDouble("value"), 
				jsonObj.getLong("timestamp"));
	}
	
	@Override
	public String toString() {
		JSONObject jsonObj = new JSONObject();
		jsonObj.put("seqNumber", seqNumber);
		jsonObj.put("spotId", spotId);
		jsonObj.put("value", value);
		jsonObj.put("timestamp", timestamp);
		return jsonObj.toString();
	}
}