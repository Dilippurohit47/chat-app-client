import React, { useEffect, useRef, useState } from "react";
import { axios } from "../apiClient";

import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { saveUser } from "../slices/userSlice";
import { GoPlus } from "react-icons/go";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-toastify";
import { LuEyeClosed } from "react-icons/lu";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { AxiosError } from "axios";
import { savePrivateKeyToIndexedDB } from "../lib/helper";
import { Loader } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { CredentialResType, keyPair } from "../types";

const SignUp = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [selectedFile, setSelctedFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState<boolean>(false);
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [showPassword,setShowPassword] = useState<boolean>(false)
  const [signupLoaing , setsignUploading] = useState<boolean>(false)
  const [isUserNameExist ,setIsUserNameExist] = useState<boolean | null>(null)
  const dispatch = useDispatch();     
  const navigate = useNavigate();

const checkUsername = async()=>{
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL_HTTP}/user/check-username?username=${name}`)
    console.log(response)
    if(response.status === 200  &&  response.data.exist !== null){
      setIsUserNameExist(response?.data?.exist)
    }
  } catch (error) {
    console.log(error)
    setError("something went wrong!")
  }
}

useEffect(()=>{
  if(!name || name.length < 3 ) return
  console.log(name , name.length)
  const id = setTimeout(() => {
  checkUsername()    
  }, 300);

  return ()=>{
    clearTimeout(id)
  }
},[name])


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
  
  const generateKeys =  async():Promise<keyPair> =>{
    try {
      const keyPair = await window.crypto.subtle.generateKey(
  {
    name: "RSA-OAEP",
    modulusLength: 4096,
    publicExponent: new Uint8Array([1, 0, 1]), 
    hash: "SHA-256", 
  },
  true, 
  ["encrypt", "decrypt"]
);

const publicKeyExported = await crypto.subtle.exportKey("spki", keyPair.publicKey);
const privateKeyExported = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

const publicKeyString = btoa(String.fromCharCode(...new Uint8Array(publicKeyExported)));
const privateKeyString = btoa(String.fromCharCode(...new Uint8Array(privateKeyExported)));

return {publicKey:publicKeyString  , privateKey : privateKeyString}

    } catch (error) {
      console.log("error in generating private public keys ",error)
      throw error
    }
  }



  const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) =>
     {
    e.preventDefault();
    setsignUploading(true)
    try {
        const {publicKey , privateKey } = await generateKeys()
  await  savePrivateKeyToIndexedDB(privateKey)
      const res = await axios.post(
       `${import.meta.env.VITE_BASE_URL_HTTP}/user/sign-up`,
        {
          name,
          email,
          password, 
          profileUrl:image,
          publicKey:publicKey
        },
        {
          withCredentials: true,
        }
      );
      if (res.status === 200) {
          const user = res.data.user;
    dispatch(saveUser({
      id: user.id,
      name: user.name,
      email: user.email,
      profileUrl: user.profileUrl,
      publickey: user.publickey,
        accessToken: res.data.accessToken,
      isLogin: true,
    }));
        toast.success("Signup Successfully")
        navigate("/")
      }else{
        console.log(res.data.errors[0])
      }
    } catch (error) {
      console.log(error)
      const err = error as AxiosError<{message:string}>
        setError(err.response?.data?.message || "Something went wrong")
    }finally{
      setsignUploading(false)
    }
  };
  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
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
        if(!selectedFile) return

        try {
                await axios.put(uploadUrl, selectedFile, {
          headers: { "Content-Type": selectedFile.type },
        });
          console.log("image successfully uploaded to s3");
          setImage(uploadUrl?.split("?")[0]);
          setIsImageUploaded(true);
        } catch (error) {
          console.log("failed to upload image to s3" ,error);
          setError("Failed to upload image try again")
          setImageUploading(false)
          setImageFile(null)
        }

        
      }else{
        console.log("error in getting signedIn url try again later")
           setImageUploading(false)
      setImageFile(null)
      }
    } catch (error) {
      console.log(error);
      setImageUploading(false)
      setImageFile(null)

    } finally {
      setImageUploading(false);
    }
  };


useEffect(() =>{
if(imageFile){
uploadImageToS3()
}
},[imageFile])

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
console.log("log",isUserNameExist)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 cursor-pointer">
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
              {imageUploading &&
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
          <div className="mb-4 ">
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
{
  isUserNameExist !== null &&             <span className={`text-start block ${isUserNameExist ? "text-red-500" :"text-green-600"}`}>{
 isUserNameExist ? "username already exist" : "username is available"           
}</span>
}
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
          <div className="mb-6 relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 text-start"
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
            className="w-full cursor-pointer flex justify-center items-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={imageUploading}
          >
          {
            signupLoaing ? <Loader className="animate-spin text-center" /> :   "Sign Up"
          }
          </button>
        </form>

            <div className="my-2  font-medium ">or</div>
            
<div className="  hidden flex justify-center  items-center gap-2 py-2 border-2 rounded-md  hover:bg-gray-200 cursor-pointer " onClick={()=>loginWithGoogle()}>Continue with Google <FcGoogle size={21} /> </div>


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
