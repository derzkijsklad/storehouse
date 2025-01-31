/* eslint-disable @typescript-eslint/no-unused-vars */
import axiosInstance from './axiosInstance';

interface Statistics {
  date: string;
  totalOrders: number;
  closedOrders: number;
  openOrders: number;
  avgProcessingTime: number;
}

export const getStatistics = async (): Promise<Statistics[]> => {
  const token = sessionStorage.getItem('authToken');
  if (!token) {
    throw new Error('Authentication token not found');
  }

  try {
    const response = await axiosInstance.get('/api/orders', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data: Statistics[] = response.data as Statistics[];
    return data;
  } catch (error) {
    throw new Error('Error fetching statistics data');
  }
};
