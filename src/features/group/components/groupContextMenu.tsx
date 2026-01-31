import { FiTrash, FiX } from "react-icons/fi";
import { LuMessageSquareOff } from "react-icons/lu";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import React, { useEffect, useRef } from "react";
import { useWebSocket } from "../../../context/webSocket";
import { toast } from "react-toastify";
import { SelectedGroupType } from "../types";
import { deleteGroup } from "../api/api";

const GroupContextMenuDialogBox = ({ open, setOpen ,groupId ,setSelectedGroup}:{open:null | string  ,setOpen:(state:null)=>void ,groupId:string ,setSelectedGroup:React.Dispatch<React.SetStateAction<SelectedGroupType | null>> }) => {
const isOpen = !!open;
const contextMenuRef = useRef<HTMLDivElement | null>(null)

  
const {ws} = useWebSocket()
const user = useSelector((state:RootState)=>state.user)
const deleteGroupHandle = async (groupId:string , userId:string | null) =>{
  try {
if(!userId) return
    await deleteGroup({groupId,userId:userId})
      toast.success("Group Delete")
      setSelectedGroup(null)
      if(!ws.current) return
      ws.current.send(
        JSON.stringify({
          type:"send-groups",
          userId:user.id
        })
      )
  } catch (error) {
    console.log(error)
  }
}

  const options = [
  { label: "delete group", icon: <LuMessageSquareOff />, onClick: () => deleteGroupHandle(groupId ,user?.id)},
  { label: "Delete Chat", icon: <FiTrash />, onClick: () => {} },
  { label: "Close", icon: <FiX />, onClick: () => {} },
];


 

useEffect(() =>{
    const handleClickOutside =(e:MouseEvent)=>{
        if(contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)){
            setOpen(null)
        }
    }
    window.addEventListener("click",handleClickOutside) 
    return () =>{
        window.removeEventListener("click",handleClickOutside)
    }
},[])


  return (
    <div
   ref={contextMenuRef}    className={`absolute top-15 right-0 z-10 rounded shadow bg-white overflow-hidden transition-all duration-200
      ${isOpen ? "w-[12rem] py-2 opacity-100" : "w-0 py-0 opacity-0 pointer-events-none"}`}
    >
      {options.map((option, index) => (
        <div
          key={index}
          onClick={(e) => { e.preventDefault()
            if (option.onClick) option.onClick();
            setOpen(null); 
          }}
          className="flex items-center gap-2 px-4 py-2 text-start text-sm font-[500] hover:bg-gray-100 cursor-pointer transition-colors"
        >
          <span className="text-gray-600 text-[16px]">{option.icon}</span>
          <span className=" z-50 "> {option.label}</span>
        </div>
      ))}
    </div>
  );
};

export default GroupContextMenuDialogBox;
