import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { logout } from "../slices/userSlice";
import axios from "axios";
import { useState } from "react";
import CreateGroupDialogBox from "./createGroupDialogBox";
const Navbar = () => {
// const  [createGroupDialog,setCreateGroupDialog] = useState<boolean>(false)
    const user = useSelector((state:RootState) =>state.user)
    const dispatch = useDispatch()
    const logoutUser =async() =>{
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL_HTTP}/user/sign-out`,{},{
        withCredentials:true
      })
      if(res.status === 200){
        dispatch(logout())
        console.log("log out successfully")
        
      }
    }

  return (
    <div className="bg-[#3F3D56]  text-white mb-2 rounded-md py-2 flex justify-between px-5 items-center min-h-[3rem]">
     <a href="/"> <h1 className="font-[500]">{user.isLogin ?  user.name : "Chat-App"}  </h1></a> 
    {
      user.isLogin ?   <div className=" flex justify-center items-center gap-6">
<CreateGroupDialogBox />
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="cursor-pointer" >
            <AvatarImage src={user.profileUrl ? user.profileUrl : "https://github.com/shadcn.png"} alt="profile-img"  className="object-cover"/>
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent >
          <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={logoutUser}>Log Out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>  :  
    <a href="/login" > <button className="cursor-pointer">Login</button></a>
   
    }
    </div>
  );
};

export default Navbar;
