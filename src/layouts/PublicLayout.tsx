import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { logout, saveAccessToken, saveUser } from "../slices/userSlice";
const PublicLayout = () => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const refreshRes = await axios.get(
          `${import.meta.env.VITE_BASE_URL_HTTP}/user/refresh`,
          { withCredentials: true }
        );

        if (refreshRes.status === 200) {
          const accessToken = refreshRes.data.accessToken;
          dispatch(saveAccessToken({ accessToken }));

          const userRes = await axios.get(
            `${import.meta.env.VITE_BASE_URL_HTTP}/user/get-user`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              withCredentials: true,
            }
          );

          if (userRes.status === 200) {
            dispatch(saveUser(userRes.data.user));
          }
        }
      } catch (err) {
        dispatch(logout());
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        Loading...
      </div>
    );
  }

  if (user.isLogin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicLayout;


