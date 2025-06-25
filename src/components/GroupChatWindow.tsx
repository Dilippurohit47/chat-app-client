import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { MdOutlineAttachment } from "react-icons/md";
import { IoMdSearch } from "react-icons/io";
import SearchBarForChat from "../components/SearchBarForChat";
import { UserType } from "../slices/userSlice";
import { toast } from "react-toastify";
import { FaArrowLeftLong } from "react-icons/fa6";
import { FiUserPlus } from "react-icons/fi";  
import { HiUserPlus } from "react-icons/hi2";
export type MessageType = {
  id?: string;
  senderId: String;
  receiverId: String;
  content: string;
  createdAt: number;
};
type selectedChat = {
  chatId: string;
  createdAt: string; // or `Date` if parsed
  email: string;
  id: string;
  lastMessage: string;
  lastMessageCreatedAt: string; // or `Date` if parsed
  name: string;
  password: string;
  profileUrl: string;
  unreadMessages: {
    userId: string;
    unreadMessages: number;
  };
};



const GroupChatWindow = ({
  ws,
  senderId,
  selectedGroup,
  setSelectedGroup,
  logedInUser,
}) => {
  const [input, setInput] = useState<string>("");
  const chatWindowRef: React.RefObject<HTMLDivElement | null> = useRef(null);

  const [messages, setMessages] = useState<MessageType[] | []>([]);
  const [openSearchBar, setOpenSearchBar] = useState<boolean>(false);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [findMessagesIds, setFindMessagesIds] = useState<string[]>([]);
  const [cursorId, setCursorId] = useState<string | null>(null);
  const [loadingMoreChat,setLoadingMoreChat] = useState<boolean>(false)
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [hasMoreMsg,setHasMoreMsg] = useState<boolean>(false)
  const [initialLoad ,setInitialLoad] = useState(true)
  const messageInputRef = useRef<HTMLInputElement | null>(null)

const newMessage =(senderId,input) =>{
  return {
    senderId:senderId,
    content:input
  }
}

  const sendMessage =() =>{
    const msg = newMessage(senderId,input)
ws.send(JSON.stringify({
  type:"group-message",
  groupId:selectedGroup.id,
  message:msg
}))
setMessages(prev =>[...prev,msg])
setInput("")
  }

const handleKeyDown = (e) =>{
if(e.key === "Enter"){
  sendMessage()
}
}
useEffect(() =>{
  const handleMessage =(e) =>{
    const data = JSON.parse(e.data)
    console.log(data)
    if(data.type === "group-message"){
        const msg = newMessage(data.senderId,data.content)
        setMessages((prev) =>[msg,...prev])
    }
  }
  ws.addEventListener("message",handleMessage)

  return () =>{
    ws.removeEventListener("message",handleMessage)
  }
},[])
const [addMoreMembersDialog,setAddMoreMembersDialog] = useState()
  return (
    <div className="flex relative  flex-col h-[100%] p-4 bg-[#1e1e2e] rounded-2xl  ">
      <div className=" px-4 bg-[#ffffffc6] h-10 rounded-sm flex justify-between items-center gap-3">
        <div className="flex justify-between items-center gap-3">
          <img
           src={selectedGroup?.profileUrl ? selectedGroup.profileUrl : "https://github.com/shadcn.png"}
            className="h-8 w-8 object-cover rounded-full"
            alt=""
          />
          <h1
            className="text-black font-semibold"
          >
            {" "}
            {selectedGroup?.name}
          </h1>
        </div>
        <div className="flex gap-5 justify-center items-center">
<div onClick={()=>setSelectedGroup(null)} className="cursor-pointer">
        <FaArrowLeftLong  size={20}/>

</div>
<div className="cursor-pointer">
  <HiUserPlus size={20}/>
  </div>
     <div
          className="cursor-pointer"
          onClick={() => {
            setOpenSearchBar(!openSearchBar), setFindMessagesIds([]);
          }}
        >
          <IoMdSearch size={24} />
        </div>
        </div>
   
      </div>
      <SearchBarForChat
        // messageIndex={messageIndex}
        totalFindmessages={findMessagesIds.length}
        isOpen={openSearchBar}
        messages={messages}
        // findMessages={findMessages}
        // scrollToFindMessageForward={scrollToFindMessageForward}
        // scrollToFindMessageBackward={scrollToFindMessageBackward}
      />
 {
  loadingMoreChat &&  <div className="flex justify-center">
  <svg className="loader" viewBox="25 25 50 50">
  <circle r="20" cy="50" cx="50"></circle>
</svg>
  </div>
 }
      <div
        // ref={messageContainerRef}
        className="flex-1 overflow-y-auto hide-scrollbar  mt-2 "
      >
        {messages.slice().reverse().map((message, index) => {
          const isLast = index === messages.length - 1;
          return (
            <div
              key={message.id}
              // ref={(el) => setRefs(el, message.id!, isLast)}
              className={`mb-4 ${
                message.senderId === senderId ? "text-right" : "text-left"
              }`}
            >
              <div
                className={`inline-block p-3 rounded-lg ${
                  message.senderId === senderId
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }
              `}
              >
                {message.content}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {/* {formatDate(message.createdAt)}  */}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex gap-2 justify-center items-center ">
        <input
          value={input}
          type="text"
          placeholder="Type a message..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none text-white focus:border-blue-500"
          ref={messageInputRef}
        />

        <label htmlFor="file-input">
          <MdOutlineAttachment
            className="text-gray-300 rotate-120 hover:text-gray-500 cursor-pointer"
            size={26}
          />
        </label>
        <input
          id="file-input"
          type="file"
          className="hidden w-0 h-0 bg-red-500"
        />
        <button
          className="ml-2 p-2 bg-blue-500 hover:bg-blue-700 text-white
        rounded-lg focus:outline-none focus:bg-blue-700 cursor-pointer"
          onClick={sendMessage}
          disabled={!input.length}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default GroupChatWindow;
