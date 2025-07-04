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
import { HiUserPlus } from "react-icons/hi2";

import { Input } from "./ui/input";
import { Label } from "./ui/label";

import { FiPlus } from "react-icons/fi";
import { FiMinus } from "react-icons/fi";
import axios from "axios";
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
  const [addedMembers, setAddedMembers] = useState<string[]>([userId]);
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
    if (addedMembers.includes(id)) {
      const filterArray = addedMembers.filter((userId) => userId !== id);
      setAddedMembers(filterArray);
    } else {
      setAddedMembers((prev) => [...prev, id]);
    }
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
      }
    } catch (error) {
      toast.error(error?.data?.message);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <button className="cursor-pointer " onClick={() => setDialogOpen(true)}>
          <HiUserPlus />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] h-[30rem]! gap-2 ">
        <DialogHeader>
          <DialogTitle>Add new members</DialogTitle>
          <DialogDescription>
            Add your favourites members and talk with all .
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 ">
          <div className="flex items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            {selectedGroup.name}
          </div>
          <div className="text-red-500">{error && error}</div>
        </div>
        <DialogFooter className=" justify-between!  ">
          <div className=" bg-zinc-300  rounded-sm p-1 w-[80%] h-[18rem] hide-scrollbar overflow-y-auto gap-2 flex flex-col ">
            {totalUsers.length > 0 &&
              totalUsers.map((u) => {
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
                      <h1> {u.name}</h1>
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
              })}
          </div>
          <Button className="cursor-pointer" onClick={AddNewMembersInGroup}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddMoreMembersInGroupDialogBox;
