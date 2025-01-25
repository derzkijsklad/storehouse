import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  if (!config.headers) {
    config.headers = {};
  }
  const token = sessionStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;

// import axios from "axios";

// const axiosInstance = axios.create({
//   baseURL: process.env.REACT_APP_BASE_URL || "http://localhost:5000", 
//   headers: {
//     "Content-Type": "application/json",
//   },
//   withCredentials: true,
// });

// axiosInstance.interceptors.request.use((config) => {
//   if (!config.headers) {
//     config.headers = {};
//   }
//   const token = sessionStorage.getItem("authToken");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default axiosInstance;