// apiClient.js
import axiosLib from "axios";
import {  store } from "./store"; // if you're using redux
import { saveAccessToken, logout } from "./slices/userSlice";
import { useSelector } from "react-redux";
const axios = axiosLib.create({
  baseURL: import.meta.env.VITE_BASE_URL_HTTP,
  withCredentials: true,
});




// Interceptors
axios.interceptors.request.use((config) => {
  const token = store.getState().user.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (originalRequest.url?.includes("/user/refresh")) {
      return Promise.reject(error);
    }

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // ✅ if refresh already running, wait in queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axios(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshRes = await axiosLib.get(
          `${import.meta.env.VITE_BASE_URL_HTTP}/user/refresh`,
          { withCredentials: true }
        );

        const newAccessToken = refreshRes.data.accessToken;
        store.dispatch(saveAccessToken({ accessToken: newAccessToken }));

        // ✅ release all waiting requests
        processQueue(null, newAccessToken);

        // ✅ retry original request too
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (err) {
        processQueue(err, null);
        store.dispatch(logout());
        return Promise.reject(err);
      } finally {
        isRefreshing = false; // ✅ MUST
      }
    }

    return Promise.reject(error);
  }
);


// ⬇️ Named export instead of default
export { axios };
