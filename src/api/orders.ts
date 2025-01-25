/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "./axiosInstance";

export interface Order {
  id: number;
  container_id: number;
  product_name: string;
  quantity: number;
  order_status: string;
  created_at: string;
  closed_at: string | null;
}

export interface OrderDetails extends Order {
  items: { name: string; quantity: number }[];
}

export interface CreateOrderPayload {
  container_id: number;
  product_name: string;
  quantity: number;
}

export interface CloseOrderPayload {
  id: number;
}

const getAuthToken = (): string => {
  return sessionStorage.getItem("authToken") || "";
};

export const fetchOrders = async (token: string = getAuthToken()): Promise<Order[]> => {
  const response = await axiosInstance.get("/api/orders", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data as Order[];
};

export const fetchOrderDetails = async (id: string): Promise<OrderDetails> => {
  const response = await axiosInstance.get(`/api/orders/${id}`);
  return response.data as OrderDetails;
};

export const createOrder = async (payload: CreateOrderPayload, token: string = getAuthToken()): Promise<Order> => {
  try {
    const response = await axiosInstance.post("/api/orders", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data as Order;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create order");
  }
};

export const closeOrder = async (payload: CloseOrderPayload, token: string = getAuthToken()): Promise<Order> => {
  try {
    const response = await axiosInstance.post("/api/orders/close", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data as Order;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to close order");
  }
};

export const checkProductExists = async (product_name: string, token: string = getAuthToken()): Promise<boolean> => {
  const response = await axiosInstance.get(`/api/products/${product_name}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.status === 200;
};

export const addProduct = async (product_name: string, token: string = getAuthToken()): Promise<void> => {
  await axiosInstance.post(
    "/api/products",
    { product_name },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};
