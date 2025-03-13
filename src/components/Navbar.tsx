import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useSelector } from "react-redux";
import { RootState } from "../store";
const Navbar = () => {

  const user = useSelector((state:RootState) =>state.user)
  return (
    <div className="bg-[#3F3D56]  text-white mb-2 rounded-md py-2 flex justify-between px-5 items-center">
      <h1 className="font-semibold">Chat</h1>
    {
      user.isLogin ?   <div className=" flex justify-center items-center">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="cursor-pointer" >
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent >
          <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">Log Out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>  :  
    <a href="/login" > <button className="cursor-pointer">Login</button></a>
   
    }
    </div>
  );
};

export default Navbar;
