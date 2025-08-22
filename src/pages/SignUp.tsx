import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { saveUser } from "../slices/userSlice";
import { GoPlus } from "react-icons/go";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-toastify";
const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [selectedFile, setSelctedFile] = useState();
  const [imageUploading, setImageUploading] = useState<boolean>(false);
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const dispatch = useDispatch();     
  const navigate = useNavigate();
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
       `${import.meta.env.VITE_BASE_URL_HTTP}/user/sign-up`,
        {
          name,
          email,
          password,
          profileUrl:image
        },
        {
          withCredentials: true,
        }
      );
      if (res.status === 200) {
        dispatch(saveUser(res.data.user));
        toast.success("Signup Successfully")
        navigate("/")
      }else{
        console.log(res.data.errors[0])
      }
    } catch (err) {
        setError(err.response.data?.message)
      console.log("Login error:", err.response);
    }
  };
  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelctedFile(file);
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImageFile(imageUrl);
    }
  };
  const removeImage = () => {
    setImage(null);
    setImageFile(null)
    setIsImageUploaded(false);
  };

  const uploadImageToS3 = async () => {
    try {
      setImageUploading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL_HTTP}/aws/get-presigned-url-s3`,
        {},
        {
          withCredentials: true,
        }
      );
      if (res.status === 200) {
        const uploadUrl = res.data.url;
        if (!uploadUrl) return console.log("upload url is absent");
        const uploadRes = await axios.put(uploadUrl, selectedFile, {
          headers: { "Content-Type": selectedFile.type },
        });
        if (uploadRes.status !== 200) {
          console.log("failed to upload image to s3");
          setError("Failed to upload image try again")
        } else {
          console.log("image successfully uploaded to s3");
          setImage(uploadUrl?.split("?")[0]);
          setIsImageUploaded(true);
        }
      }else{
        console.log("error in getting signedIn url try again later")
      }
    } catch (error) {
      console.log(error);
    } finally {
      setImageUploading(false);
    }
  };


useEffect(() =>{
if(imageFile){
uploadImageToS3()
}
},[imageFile])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Welcome
        </h2>

        <div className=" flex flex-col  justify-center relative items-center gap-2">
          <img
            src={imageFile ? imageFile : "./profile.jpg"}
            alt=""
            className="h-28 w-28 object-cover  rounded-full"
          />
          {image && (
            <div
              className="absolute top-0 right-[9.1rem] bg-gray-200 cursor-pointer rounded-full p-1 "
              onClick={removeImage}
            >
              <RxCross2 size={16} />
            </div>
          )}
          {image ? (
            <button
              className={` rounded-md text-white px-6 py-1 cursor-pointer text-[1.1rem] ${isImageUploaded ? "bg-zinc-400":'bg-blue-600'}`}
              onClick={uploadImageToS3}
              disabled={image  ? true : false}
            >
              {isImageUploaded
                ? "Uploaded"
                : imageUploading
                ? "uploading..."
                : "Save"}
            </button>
          ) : (
            <>
              <label
                htmlFor="select-profile"
                className="bg-gray-200 rounded-sm px-3 py-1 flex justify-center items-center gap-1 cursor-pointer"
              >
                {!imageFile && (
                  <>
                    Upload profile <GoPlus className="" size={20} />{" "}
                  </>
                )}
              </label>
              {
                imageFile && !image && <label
                className="bg-gray-200 rounded-sm px-3 py-1 flex justify-center items-center gap-1 cursor-pointer"
              >
                    Uploading..
              </label>
              }
              <input
                type="file"
                className="hidden"
                id="select-profile"
                onChange={handleFileChange}
              />
            </>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-start text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 text-start "
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
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 text-start"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full cursor-pointer bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={imageUploading}
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
