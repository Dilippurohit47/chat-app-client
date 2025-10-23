import { axios } from "./apiClient";;
import  React, { useEffect, useState } from "react";
import Login from "./pages/LoginPage";

const Layout = ({ children }:{children:React.ReactNode}) => {
  const [user, setUser] = useState();
  useEffect(() => {
    const getUser = async () => {
      const res = await axios.get(`${import.meta.env.e}/user/get-user`, {
        withCredentials: true,
      });
      if (res.status === 200) {
        setUser(res.data);
        localStorage.setItem("userId", res.data.id);
        }
    };
    getUser();
  }, []);
  return user ? children : <Login />;
};

export default Layout;
