// import axios from "axios";
// import  { useEffect, useState } from "react";
// import Login from "./pages/LoginPage";

// const Layout = ({ children }) => {
//   const [user, setUser] = useState();
//   useEffect(() => {
//     const getUser = async () => {
//       const res = await axios.get("http://localhost:8000/user/get-user", {
//         withCredentials: true,
//       });
//       if (res.status === 200) {
//         setUser(res.data);
//         localStorage.setItem("userId", res.data.id);
//         }
//     };
//     getUser();
//   }, []);
//   return user ? children : <Login />;
// };

// export default Layout;
