import { FiTrash, FiX, FiUserX } from "react-icons/fi";
import { LuMessageSquareOff } from "react-icons/lu";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { SetStateAction, useEffect, useRef } from "react";
import { useChatActions } from "../hooks/useChatActions";
import { toast } from "react-toastify";

const ContextMenuDialogBox = ({ open, setOpen, chatId ,onSelectUser ,deletechat }:{open:null | string , setOpen:React.Dispatch<SetStateAction<string | null >>, chatId:string,onSelectUser:(state:null)=>void ,deletechat:(state:string) =>void})=> {
  const isOpen = !!open;
 const user = useSelector((state:RootState) =>state.user)  
 const contextMenuRef = useRef<HTMLDivElement | null >(null)
 const {clearChat ,deleteChat} = useChatActions({currentUserId:user.id , chatId})

 const onHandleClearChat = async()=>{
  const response = await clearChat()
  console.log("response",response)
  if(!response){
    toast.error("Something went wrong")
    return
  }
 }


const onHandleDeleteChat =  async() =>{
  const response = await deleteChat()
  if(!response){
    toast.error("Something went wrong")
    return
  }
deletechat(chatId)
onSelectUser(null)
}


  const options = [
  { label: "Clear Chat", icon: <LuMessageSquareOff />, onClick: onHandleClearChat },
  { label: "Delete Chat", icon: <FiTrash />, onClick: onHandleDeleteChat},
  { label: "Block User", icon: <FiUserX />, onClick: () => {} },
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
