/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "./axiosInstance";

export interface Order {
  id: number;
  spot_id: number;
  value: number;
  is_closed: boolean;
  created_at: string;
  timestamp: string;
}

export interface OrderDetails extends Order {
  items: { name: string; quantity: number }[];
}

export interface CreateOrderPayload {
  spot_id: number;
  value: number;
}

export interface CloseOrderPayload {
  id: number;
}

const getAuthToken = (): string => {
  return sessionStorage.getItem("authToken") || "";
};

export const fetchOrders = async (
  filters: { id?: number; is_closed?: boolean; date?: string },
  token: string = getAuthToken()
): Promise<Order[]> => {
  const response = await axiosInstance.get("/api/orders", {
    headers: { Authorization: `Bearer ${token}` },
    params: filters,
  });
  return response.data as Order[];
};

export const fetchOrderDetails = async (
  id: string,
  token: string = getAuthToken()
): Promise<OrderDetails> => {
  const response = await axiosInstance.get("/api/orders", {
    headers: { Authorization: `Bearer ${token}` },
    params: { id },
  });
  return response.data as OrderDetails;
};

export const createOrder = async (
  payload: CreateOrderPayload,
  token: string = getAuthToken()
): Promise<Order> => {
  try {
    const response = await axiosInstance.post("/api/orders", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data as Order;
  } catch (error: any) {
    console.log("Error creating order:", error.response?.data?.text);
    throw new Error(error.response?.data?.text || "Failed to create order");
  }
};

export const closeOrder = async (
  payload: CloseOrderPayload,
  token: string = getAuthToken()
): Promise<Order> => {
  try {
    const response = await axiosInstance.put("/api/orders", undefined, {
      headers: { Authorization: `Bearer ${token}` },
      params: { id: payload.id },
    });
    return response.data as Order;
  } catch (error: any) {
    console.log("Error closing order:", error.response?.data?.text);
    throw new Error(error.response?.data?.text || "Failed to close order");
  }
};

export const checkProductExists = async (
  product_name: string,
  token: string = getAuthToken()
): Promise<boolean> => {
  const response = await axiosInstance.get(`/api/products/${product_name}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.status === 200;
};

export const addProduct = async (
  product_name: string,
  token: string = getAuthToken()
): Promise<void> => {
  await axiosInstance.post(
    "/api/products",
    { product_name },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};
