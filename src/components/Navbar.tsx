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
import { axios } from "../apiClient";;
import CreateGroupDialogBox from "./CreateGroupDialogBox";
import {logout} from "../slices/userSlice"
const Navbar = () => {
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
    <div className="bg-[#3F3D56]    text-white max-md:mb-2  max-md:rounded-md py-2 flex justify-between px-5 items-center min-h-[3rem] md:px-2 md:mb-0 md:rounded-none">
    
   
     <a href="/"> <h1 className="font-[500]">{user.isLogin ?  user.name?.split(" ")[0] : "Chat-App"}  </h1></a> 
    
   <div className="mt-3 hidden rounded-md border border-red-300 bg-red-100 px-4 py-3 text-sm font-semibold text-red-700">
  🚧 Currently migrating my VPS — please check back later.
</div>


    {
      user.isLogin ?   <div className="   flex justify-center items-center gap-6">
<CreateGroupDialogBox userId={user.id}  />
      <DropdownMenu >
        <DropdownMenuTrigger>
      <Avatar className="cursor-pointer">
  <AvatarImage
    src={user?.profileUrl?.trim() || "https://github.com/shadcn.png"}
    alt="profile-img"
    className="object-cover"
  />
  <AvatarFallback>
    {user?.name?.slice(0, 2).toUpperCase() || "CN"}
  </AvatarFallback>
</Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white" >
          <DropdownMenuLabel>{user?.name?.split(" ")[0]}</DropdownMenuLabel>
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
