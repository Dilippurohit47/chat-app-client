import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { HiUserPlus } from "react-icons/hi2";
import { FaSearch } from "react-icons/fa";
import { Label } from "./ui/label";

import { FiPlus } from "react-icons/fi";
import { FiMinus } from "react-icons/fi";
import { axios } from "../apiClient";;
import { toast } from "react-toastify";

export interface UserTypes {
  id: string;
  name: string;
  email: string;
  isLogin: boolean;
  profileUrl: string | undefined;
}

const AddMoreMembersInGroupDialogBox = ({ userId, selectedGroup }: string) => {
  const [totalUsers, setTotalUsers] = useState<UserTypes[]>([]);
  const [filterUsers,setFilterUsers] = useState<UserTypes[]>([])
  const [addedMembers, setAddedMembers] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  useEffect(() => {
    const getTotalUser = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL_HTTP}/user/all-users`,
          { withCredentials: true }
        );
        if (res.status === 200) {
         const memberIds = new Set(selectedGroup.members?.map(m => m.userId));
         console.log('membere ids',memberIds)
        const filterData = res.data?.filter(user => {
          console.log(user.id , memberIds.has(user.id))
          return !memberIds.has(user.id)
        });
          setTotalUsers(filterData);
          setFilterUsers(filterData);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getTotalUser();
  }, []);
const addMembers = (id: string) => {
  if (id === userId) {
    toast.error("Admin cannot be removed");
    return;
  }

  setAddedMembers((prev) => {
    if (prev.includes(id)) {
      return prev.filter((userId) => userId !== id);
    } else {
      return [...prev, id];
    }
  });
};
  const [error, setError] = useState<string>("");
 
  const AddNewMembersInGroup = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL_HTTP}/group/add-new-members`,
        {
          newMembers: addedMembers,
        },
        { withCredentials: true, params: { groupId: selectedGroup.id } }
      );
      if (res.status === 200) {
        toast.success(" New memebers Added");
        setDialogOpen(false)
        setAddedMembers([])
      }
    } catch (error) {
      toast.error(error?.data?.message);
    }
  };

  const filterUsersForSearch =(name:string) =>{
    const newArray = totalUsers.map((user) =>{
      if(user.name.toLocaleLowerCase().includes(name.toLocaleLowerCase())){
        return user
      }
    }).filter((i)=> i)
setFilterUsers(newArray)
  }

  const handleDialogClose = () =>{
    setAddedMembers([])
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) =>{setDialogOpen(open);if(!open){handleDialogClose()} }} >
      <DialogTrigger asChild>
        <button className="cursor-pointer " onClick={() => setDialogOpen(true)}>
          <HiUserPlus />
        </button>
      </DialogTrigger>
         
      <DialogContent className="sm:max-w-[425px] h-[30rem]! gap-2  bg-white max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add new members</DialogTitle>
          <DialogDescription>
            Add your favourites members and talk with all .
   
          </DialogDescription>
   
        </DialogHeader>
 
        <div className="grid gap-4 py-2 ">
          <div className="flex items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name :
            </Label>
           <span className=" after:content-['']   after:block after:h-[1px] after:bg-gray-400 ">{selectedGroup.name}</span>
          </div>
          <div className="text-red-500">{error && error}</div>
        </div>
        <DialogFooter className=" justify-between!  ">
          <div className=" bg-zinc-300  rounded-sm p-1 w-[80%]  hide-scrollbar  gap-2 flex flex-col ">
            <div className="relative  w-full ">
          <input  onChange={(e)=>filterUsersForSearch(e.target.value)} className="bg-white   w-full rounded-[0.5rem] border-none focus-within:outline-0  top-0  px-1  py-1 " id="search-bar"/>
          <div className="absolute right-2 top-1 ">
            <FaSearch size={22} className="text-blue-400"/>
          </div>
            </div>

<div className="overflow-y-auto hide-scrollbar h-[18rem]  gap-2 flex flex-col ">

            {filterUsers.length > 0 ?
              filterUsers.map((u) => {
                if (u.id === userId) {
                  return;
                }
                return (
                  <div className="bg-white px-2 py-3 rounded-sm flex justify-between items-center">
                    <div className="flex gap-2">
                      <img
                        src={u.profileUrl}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <h1 className=""> {u.name}</h1>
                    </div>
                    <button
                      className="   text-white  text-[0.8rem] text-center cursor-pointer "
                      onClick={() => addMembers(u.id)}
                    >
                      {!addedMembers.includes(u.id) ? (
                        <div className="  rounded-sm  px-2 py-1  bg-blue-500 flex gap-1 justify-center items-center">
                          Add
                          <FiPlus />
                        </div>
                      ) : (
                        <div className="bg-red-400 px-2 py-1  rounded-sm flex gap-1 justify-center items-center  ">
                          remove <FiMinus />
                        </div>
                      )}
                    </button>
                  </div>
                );
              }) : <div className="px-2"> no users available</div>}
          </div>
</div>


          <Button className="cursor-pointer bg-blue-500 text-white max-w-[100%]" onClick={AddNewMembersInGroup}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddMoreMembersInGroupDialogBox;
