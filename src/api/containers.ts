import axiosInstance from "./axiosInstance";

export const fetchContainers = async () => {
  const response = await axiosInstance.get("/api/containers");
  return response.data;
};
