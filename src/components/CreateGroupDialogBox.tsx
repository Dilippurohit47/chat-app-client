import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

import { FiPlus } from "react-icons/fi";
import { FiMinus } from "react-icons/fi";
import axios from "axios";


export interface UserTypes {
  id: string ;
  name: string ;
  email: string;
  isLogin: boolean;
  profileUrl: string | undefined;
}

const CreateGroupDialogBox = () => {


  const [totalUsers,setTotalUsers] = useState<UserTypes[]>([])
  const [addedMembers,setAddedMembers] = useState<string[]>([])

  const [groupName ,setGroupName] = useState<String | null>(null)
  useEffect( () => {
    const getTotalUser = async() => {
   try {
    const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL_HTTP}/user/all-users`,
        { withCredentials: true }
      );
      if (res.status === 200) {
       setTotalUsers(res.data)
      } 
      console.log(res)
   } catch (error) {
    console.log(error)
   }
    };
    getTotalUser()
  }, []);


  const addMembers =(id:string) =>{
    if(addedMembers.includes(id)){
      const filterArray = addedMembers.filter((userId) =>userId !== id)
      setAddedMembers(filterArray)
    }else{
      setAddedMembers(prev =>[...prev ,id])
    }
  }


  const createGroup = () =>{

  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="cursor-pointer ">New Group</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] h-[30rem]! ">
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
          <DialogDescription>
            Add your favourites members and talk with all .
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value="" className="col-span-3" />
          </div>
        </div>
        <DialogFooter className=" justify-between! ">
          <div className=" bg-zinc-300  rounded-sm p-1 w-[80%] h-[18rem] hide-scrollbar overflow-y-auto gap-2 flex flex-col ">
            {
              totalUsers.length > 0 && totalUsers.map((u) =>(
                <div className="bg-white px-2 py-3 rounded-sm flex justify-between items-center">
      <div className="flex gap-2">
      <img src={u.profileUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
      <h1>  {u.name}</h1>
      </div>
      <button className="   text-white  text-[0.8rem] text-center cursor-pointer "
       onClick={()=>addMembers(u.id)}>
      {
        !addedMembers.includes(u.id) ? <div className="  rounded-sm  px-2 py-1  bg-blue-500 flex gap-1 justify-center items-center">
            Add 
            <FiPlus />
        </div> : <div className="bg-red-400 px-2 py-1  rounded-sm flex gap-1 justify-center items-center  ">remove <FiMinus /></div>
      }
      </button>
                </div>
              ))
            }
          </div>
          <Button onClick={createGroup}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialogBox;
