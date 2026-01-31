import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

import { FiPlus } from "react-icons/fi";
import { FiMinus } from "react-icons/fi";
import { useWebSocket } from "../../../context/webSocket";
import { useCreateGroup } from "../hooks/useCreateGroup";

const CreateGroupDialogBox = ({userId}:{userId:string | null}) => {
    const { ws } = useWebSocket();

  const {
    totalUsers,
    addedMembers,
    groupName,
    dialogOpen,
    error,
    setGroupName,
    setDialogOpen,
    addMembers,
    createGroup,
  } = useCreateGroup  ({ userId, ws });
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen} >
      <DialogTrigger asChild>
        <button className="cursor-pointer " onClick={()=>setDialogOpen(true)}>New Group</button>
      </DialogTrigger>
      <DialogContent className=" h-[30rem]! gap-2 bg-white w-[30%]  md:w-[70%]  sm:w-[90%]     ">
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
              onChange={(e) => {setGroupName(e.target.value)}}
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
        <DialogFooter className=" justify-between! flex-col md:w-[100%]  sm:flex-col  md:max-w-[100%] max-w-[25rem] ">
          <div className=" bg-zinc-300  rounded-sm p-1 w-[100%]  md:w-[100%] h-[18rem] hide-scrollbar overflow-y-auto gap-2 flex flex-col ">
            {totalUsers.length > 0 &&
              totalUsers.map((u) => {

              if(u.id !== userId)   return <div className="bg-white px-2 py-3 rounded-sm flex justify-between items-center">
                  <div className="flex gap-2">
                    <img
                      src={u.profileUrl ? u.profileUrl : "https://github.com/shadcn.png"}
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
          <Button onClick={createGroup} disabled={addedMembers.length <= 0} className="bg-blue-600  text-white w-full md:mt-5">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialogBox;
