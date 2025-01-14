/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "./axiosInstance";

export const login = async (username: string, password: string): Promise<string> => {
  try {
    const response = await axiosInstance.post<{ token: string }>("/api/auth/login", {
      username,
      password,
    });
    return response.data.token; 
  } catch (err: any) {
    if (err.response?.status === 401) {
      throw new Error("Invalid credentials"); 
    }
    throw new Error("Something went wrong"); 
  }
};
