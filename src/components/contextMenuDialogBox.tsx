import { axios } from "../apiClient";;
import { FiTrash, FiX, FiUserX } from "react-icons/fi";
import { LuMessageSquareOff } from "react-icons/lu";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { SetStateAction, useEffect, useRef } from "react";

const ContextMenuDialogBox = ({ open, setOpen,userId ,chatId ,onSelectUser ,deletechat ,setMessages}:{open:null | string , userId:string ,setOpen:React.Dispatch<SetStateAction<string | null >>, chatId:string,setMessages:(state:[])=>void,onSelectUser:(state:null)=>void ,deletechat:(state:string) =>void})=> {
  const isOpen = !!open;

 const user = useSelector((state:RootState) =>state.user)  
  const clearChat =  async() =>{
    const res = await axios.delete(`${import.meta.env.VITE_BASE_URL_HTTP}/chat-setting/clear-chat`,{
        withCredentials:true,
        data:{
 userId:userId,
 chatId:chatId
        }
    })
if(res.status === 200){
  setMessages([])
}

}

const deleteChat =  async() =>{
  const res = await axios.delete(`${import.meta.env.VITE_BASE_URL_HTTP}/chat-setting/delete-chat`,{
    withCredentials:true,
    data:{
        userId:user.id,
        chatId:chatId
    }
  })
if(res.status === 200){
deletechat(chatId)
onSelectUser(null)
}
}


  const options = [
  { label: "Clear Chat", icon: <LuMessageSquareOff />, onClick: () => {clearChat()} },
  { label: "Delete Chat", icon: <FiTrash />, onClick: () => {deleteChat()} },
  { label: "Block User", icon: <FiUserX />, onClick: () => {} },
  { label: "Close", icon: <FiX />, onClick: () => {} },
];

const contextMenuRef = useRef<HTMLDivElement | null >(null)

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
    ref={contextMenuRef}
      className={`absolute top-15 right-0 z-50 rounded shadow bg-white overflow-hidden transition-all duration-200
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

export default ContextMenuDialogBox;
