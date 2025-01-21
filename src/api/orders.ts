/* eslint-disable @typescript-eslint/no-unused-vars */
import axiosInstance from "./axiosInstance";

export type Order = {
  id: number;
  container_id: number;
  product_name: string;
  quantity: number;
  order_status: string;
  created_at: string;
  closed_at: string | null;
};

export type OrderDetails = Order & {
  items: { name: string; quantity: number }[];
};

type CreateOrderPayload = {
  container_id: number;
  product_name: string;
  quantity: number;
};

type CloseOrderPayload = {
  id: number;
};

export const fetchOrders = async (token: string): Promise<Order[]> => {
  const response = await axiosInstance.get("/api/orders", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data as Order[];
};

export const fetchOrderDetails = async (id: string): Promise<OrderDetails> => {
  const response = await axiosInstance.get(`/api/orders/${id}`);
  return response.data as OrderDetails;
};


export const createOrder = async (payload: CreateOrderPayload, token: string): Promise<Order> => {
  const response = await axiosInstance.post("/api/orders", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data as Order;
};

export const closeOrder = async (payload: CloseOrderPayload, token: string): Promise<Order> => {
  const response = await axiosInstance.post("/api/orders/close", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data as Order;
};

export const getStatistics = async () => {
  try {
    const response = await axiosInstance.get('/api/statistics');
    return response.data;
  } catch (error) {
    throw new Error('Error fetching statistics data');
  }
};
