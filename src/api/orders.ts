import axiosInstance from "./axiosInstance";

interface Order {
  id: number;
  product_name: string;
  created_at: string;
  order_status: string;
}

interface OrderDetailsProps {
  id: string;
  product_name: string;
  quantity: number;
  order_status: string;
  created_at: string;
  closed_at: string | null;
  items: { name: string; quantity: number }[];
}

interface CreateOrderPayload {
  container_id: number;
  product_name: string;
  quantity: number;
}

interface CloseOrderPayload {
  id: number;
}

export const fetchOrders = async (): Promise<Order[]> => {
  const response = await axiosInstance.get("/api/orders");
  return response.data as Order[];
};

export const fetchOrderDetails = async (id: string): Promise<OrderDetailsProps> => {
  const response = await axiosInstance.get(`/api/orders/${id}`);
  return response.data as OrderDetailsProps;
};

export const createOrder = async (payload: CreateOrderPayload): Promise<Order> => {
  const response = await axiosInstance.post("/api/orders", payload);
  return response.data as Order;
};

export const closeOrder = async (payload: CloseOrderPayload): Promise<Order> => {
  const response = await axiosInstance.post("/api/orders/close", payload);
  return response.data as Order;
};
