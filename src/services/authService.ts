import axios from "axios";

export const login = async (username: string, password: string): Promise<string> => {
  try {
    const response = await axios.post("/api/auth/login", { username, password });
    return response.data.token;
  } catch (err: any) {
    if (err.response?.status === 401) {
      throw new Error("Invalid credentials");
    }
    throw new Error("Something went wrong");
  }
};
