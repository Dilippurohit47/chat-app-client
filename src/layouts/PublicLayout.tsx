import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { logout, saveAccessToken, saveUser } from "../slices/userSlice";
const PublicLayout = () => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch()
  const [loading,setLoading] = useState(false)
  useEffect(() => {
    setLoading(true)
    const getAccessToken = async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL_HTTP}/user/refresh`,
        {
          withCredentials: true,
        }
      );
      if (res.status === 200) {
        dispatch(saveAccessToken({ accessToken: res.data.accessToken }));
      }
      if (res.status == 403) {
        getAccessToken();
      }
      if (res.status !== 403 && res.status !== 200) {
        dispatch(logout());
      }
    };
    if (!user.accessToken) {
      getAccessToken();
    }
  }, []);
  useEffect(() => {
    const getUser = async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL_HTTP}/user/get-user`,
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
          withCredentials: true,
        }
      );
      if (res.status === 200) {
        dispatch(saveUser(res.data.user));
        setLoading(false)
      }
        setLoading(false)
    };
    getUser();
  }, [user.accessToken]);
 
  if (user.isLogin) {
    return <Navigate to="/" replace />;
  }
  
  if( loading){
    return <div className="flex justify-center items-center w-full h-full">Loading......</div>
  }

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default PublicLayout;
