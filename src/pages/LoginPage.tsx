import React, { useEffect, useState } from "react";
import { axios } from "../apiClient";

import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { saveUser } from "../slices/userSlice";
import { toast } from "react-toastify";
import { LuEyeClosed } from "react-icons/lu";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { AxiosError } from "axios";
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google";
import { Loader } from "lucide-react";
import { CredentialResType } from "../types";


 
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPassword,setShowPassword] = useState<boolean>(false)
  const [signInLoading,setSignInLoading]= useState<boolean>(false)
const dispatch = useDispatch()
  const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignInLoading(true)
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL_HTTP}/user/sign-in`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );
      if (res.status === 200) {
      const user = res.data.user;
      console.log(res.data)
dispatch(saveUser({
  id: user.id,
  name: user.name,
  email: user.email || null,
  profileUrl: user.profileUrl,
  publickey: user.publickey,
    accessToken: res.data.accessToken,
  isLogin: true,
}));

        toast.success("Login successfull")
        navigate("/");
      }
    } catch (error) {
      const err = error as AxiosError<{message:string}>
      console.log(err.response?.data?.message)
      setError(err.response?.data?.message || "Something went wrong");
      console.log("Login error:", err);
    }finally{
      setSignInLoading(false)
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL_HTTP}/user/get-user`,
        {
          withCredentials: true,
        }
      );
      if (res.status === 200) {
        dispatch(saveUser(res.data)); 
        navigate("/")
      }
    };
    getUser();
  }, []);

 const handleLoginSuccess = async (credentialResponse:CredentialResType) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL_HTTP}/user/google/callback`,
        {
          credentialResponse,
        },
        {
          withCredentials: true,
        }
      );

      if (res && res.status === 200) {
        toast.success(res.data.message);
        dispatch(saveUser(res.data.user))
        navigate("/");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message || "Internal server error");
      } else {
        toast.error("An error occurred try again later");
      }
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: (codeResponse) => handleLoginSuccess(codeResponse),
    flow: "auth-code",
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Welcome Back!
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-6 relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
              required
            />
            {
              !showPassword ? <div className="cursor-pointer absolute right-4 top-9" onClick={()=>setShowPassword(true)}>  <LuEyeClosed /></div> : <div className="cursor-pointer absolute right-4 top-9"  onClick={()=>setShowPassword(false)}>  <MdOutlineRemoveRedEye /></div>
            }
          </div>
          <button
            type="submit"
            className="w-full flex justify-center items-center  cursor-pointer bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
          {
            signInLoading ? <Loader  className="animate-spin" /> :"Login"
          }
          </button>
        </form>


            <div className="my-2  font-medium ">or</div>
            
<div className=" flex justify-center  hidden items-center gap-2 py-2 border-2 rounded-md  hover:bg-gray-200 cursor-pointer " onClick={()=>loginWithGoogle()}>Continue with Google <FcGoogle size={21} /> </div>
        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{" "}
          <a href="/sign-up" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};


export default Login;
