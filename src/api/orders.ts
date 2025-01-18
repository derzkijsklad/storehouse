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

export const fetchOrders = async (): Promise<Order[]> => {
  const response = await axiosInstance.get("/api/orders");
  return response.data as Order[];
};

export const fetchOrderDetails = async (id: string): Promise<OrderDetails> => {
  const response = await axiosInstance.get(`/api/orders/${id}`);
  return response.data as OrderDetails;
};

export const createOrder = async (payload: CreateOrderPayload): Promise<Order> => {
  const response = await axiosInstance.post("/api/orders", payload);
  return response.data as Order;
};

export const closeOrder = async (payload: CloseOrderPayload): Promise<Order> => {
  const response = await axiosInstance.post("/api/orders/close", payload);
  return response.data as Order;
};
