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
import { axios } from "../apiClient";;
import { toast } from "react-toastify";
import { useWebSocket } from "../context/webSocket";
import { AxiosError } from "axios";

export interface UserTypes {
  id: string;
  name: string;
  email: string;
  isLogin: boolean;
  profileUrl: string | undefined;
}

const CreateGroupDialogBox = ({userId}:{userId:string | null}) => {
  const [totalUsers, setTotalUsers] = useState<UserTypes[]>([]);
  const [addedMembers, setAddedMembers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const {ws } = useWebSocket()


  useEffect(() => {
    const getTotalUser = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL_HTTP}/user/all-users`,
          { withCredentials: true }
        );
        if (res.status === 200) {
          setTotalUsers(res.data);
        }
        console.log(res);
      } catch (error) {
        console.log(error);
      }
    };
    getTotalUser();
  }, []);
  const addMembers = (id: string) => {
    if(id === userId){
      toast.error("Admin cannot be removed")
      return
    }
    if (addedMembers.includes(id)) {
      const filterArray = addedMembers.filter((userId) => userId !== id);
      setAddedMembers(filterArray);
    } else {
      setAddedMembers((prev) => [...prev, id]);
    }
  };
const [error,setError] = useState<string>("")
  const createGroup = async () => {
    try {
      console.log(addedMembers)
      if(!groupName){
        setError("Group name cannot be empty!")
        return
      }
      if(addedMembers.length <= 0){
        setError("Atleast one member required to create group!")
        return
      }
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL_HTTP}/group/create-group`,
        {
          name: groupName,
          members: [...addedMembers,userId],
        }
      );
      if (res.status === 200) {
        setDialogOpen(false)
        toast.success(res.data.message);
        setGroupName("")
        setAddedMembers([])
        if(!ws.current) return

        ws.current.send(
          JSON.stringify({
            type:"send-groups",
            userId:userId
          })
        )
      }
    } catch (error) {
       const err = error as AxiosError<{ message: string }>;
        toast.error(err.response?.data.message || "something went wrong")
    }
  };
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <button className="cursor-pointer " onClick={()=>setDialogOpen(true)}>New Group</button>
      </DialogTrigger>
      <DialogContent className=" h-[30rem]! gap-2 bg-white w-[30%] md:w-[90%] ">
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
          <DialogDescription>
            Add your favourites members and talk with all .
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-1">
          <div className="flex items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={groupName}
              onChange={(e) => {setGroupName(e.target.value),setError("")}}
              className="border-2 border-gray-300 w-[70%] focus:outline-0! focus:ring-0!  focus:border-gray-300"
            />
          </div>
          <div>
            selected {addedMembers.length}
          </div>
 {error && (
  <div className="text-red-500">
    {error}
  </div>
)}

        </div>
        <DialogFooter className=" justify-between! md:flex-col">
          <div className=" bg-zinc-300  rounded-sm p-1 w-[80%] md:w-[100%] h-[18rem] hide-scrollbar overflow-y-auto gap-2 flex flex-col ">
            {totalUsers.length > 0 &&
              totalUsers.map((u) => {

              if(u.id !== userId)   return <div className="bg-white px-2 py-3 rounded-sm flex justify-between items-center">
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
                    onClick={() => addMembers(u.id)}>
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
                </div> }
              )}
          </div>
          <Button onClick={createGroup} disabled={addedMembers.length <= 0} className="bg-blue-600 text-white w-full md:mt-5">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialogBox;
