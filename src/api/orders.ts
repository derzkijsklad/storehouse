import axiosInstance from "./axiosInstance";

export const fetchOrders = async () => {
  const response = await axiosInstance.get("/api/orders");
  return response.data;
};

export const fetchOrderDetails = async (id: string) => {
  const response = await axiosInstance.get(`/api/orders/${id}`);
  return response.data;
};
