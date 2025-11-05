// apiClient.js
import axiosLib from "axios";
import { store } from "./store"; // if you're using redux
import { saveAccessToken, logout } from "./slices/userSlice";

const axios = axiosLib.create({
  baseURL: import.meta.env.VITE_BASE_URL_HTTP,
  withCredentials: true,
});

// Interceptors
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 403 &&
      error.response.data?.message === "Invalid or expired token" &&
      !originalRequest._retry
    ) {
      console.log("original",error)
      originalRequest._retry = true;

      try {
        const refreshRes = await axiosLib.get(
          `${import.meta.env.VITE_BASE_URL_HTTP}/user/refresh`,
          { withCredentials: true }
        );

          const newAccessToken = refreshRes.data.accessToken;
  // console.log("token",newAccessToken)
          store.dispatch(saveAccessToken({accessToken:newAccessToken}));

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        return axios(originalRequest); 
      } catch (err) {
        store.dispatch(logout());
      }
    }

    return Promise.reject(error);
  }
);

// ⬇️ Named export instead of default
export { axios };
