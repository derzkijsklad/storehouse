import axios from "axios";

export const fetchContainers = async () => {
  const response = await axios.get("/api/containers");
  return response.data;
};

export const fetchOrderDetails = async (id: string) => {
  const response = await axios.get(`/api/orders/${id}`);
  return response.data;
};

export const fetchOrders = async () => {
  const response = await axios.get("/api/orders");
  return response.data;
};
