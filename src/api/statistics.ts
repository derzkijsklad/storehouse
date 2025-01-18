/* eslint-disable @typescript-eslint/no-unused-vars */
import axiosInstance from './axiosInstance'; 


export const getStatistics = async () => {
  try {
    const response = await axiosInstance.get('/api/statistics'); 
    return response.data; 
  } catch (error) {
    throw new Error('Error fetching statistics data');
  }
};
