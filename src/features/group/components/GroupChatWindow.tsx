import React, {  useRef, useState } from "react";
import { MdOutlineAttachment } from "react-icons/md";
import { IoMdSearch } from "react-icons/io";
import { FaArrowLeftLong } from "react-icons/fa6";
import { HiMiniUserGroup } from "react-icons/hi2";
import AddMoreMembersInGroupDialogBox from "./AddMoreMembersInGroupDialogBox";
import GroupInfoDialog from "./GroupInfoDialog";
import { GroupChatWindowPropsType, GroupMessageType, IncomingGroupMessagePayload } from "../types";
import { newMessage } from "../utils/createNewMessage";
import { useGroupsocket } from "../hooks/useGroupSocket";



const GroupChatWindow = ({
  ws,
  senderId,
  selectedGroup,
  setSelectedGroup,
  logedInUser,
}:GroupChatWindowPropsType) => {
  const [input, setInput] = useState<string>("");
  const chatWindowRef: React.RefObject<HTMLDivElement | null> = useRef(null);

  const [messages, setMessages] = useState<GroupMessageType[] | []>([]);
  const [loadingMoreChat,setLoadingMoreChat] = useState<boolean>(false)
  const messageInputRef = useRef<HTMLInputElement | null>(null)
const [showGroupInfo,setShowGroupInfo] = useState<boolean>(false)

const onIncomingGroupMessage = (data:IncomingGroupMessagePayload)=>{
     const msg = newMessage({messageId:data.MessageId,senderId:data.senderId,input:data.content,groupId:data.groupId})
        setMessages((prev) =>[msg,...prev])
}

const {sendMessage} = useGroupsocket({ws ,senderId ,selectedGroup , onIncomingGroupMessage})

const handleSendMessageToGroup =(input:string)=>{
  if(input.trim() === "") return
  let msg = sendMessage(input)
  setMessages(prev =>[msg,...prev])
  setInput("")
}


const handleKeyDown = (e:React.KeyboardEvent<HTMLInputElement>) =>{
if(e.key === "Enter"){
  handleSendMessageToGroup(input)
}
}


const groupInfonButtonRef = useRef<HTMLDivElement | null>(null)
  return (
    <div className="flex relative  flex-col h-[100%]  max-md:p-4 p-2 bg-[#1e1e2e] max-md:rounded-2xl  overflow-hidden ">
      <div className=" px-4 bg-[#ffffffc6] h-10 rounded-sm flex justify-between items-center gap-3">
        <div className="flex justify-between items-center gap-3">
          <img
           src={selectedGroup?.groupProfilePicture ? selectedGroup.groupProfilePicture : "https://github.com/shadcn.png"}
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
<div onClick={()=>setShowGroupInfo(prev =>!prev)} className="cursor-pointer" ref={groupInfonButtonRef}>
<HiMiniUserGroup size={20} />
</div>
      <AddMoreMembersInGroupDialogBox userId={logedInUser.id!} selectedGroup={selectedGroup} />

     <div
          className="cursor-pointer"
          onClick={() => {
            // setOpenSearchBar(!openSearchBar), setFindMessagesIds([]);
          }}
        >
          <IoMdSearch size={24} />
        </div>
        </div>
   
      </div>
      <GroupInfoDialog  setSelectedGroup={setSelectedGroup} group={selectedGroup} userId={logedInUser.id} showGroupInfo={showGroupInfo}  setShowGroupInfo={setShowGroupInfo} groupInfoButtonRef={groupInfonButtonRef}/>
      {/* <SearchBarForChat
        messageIndex={messageIndex}
        totalFindmessages={findMessagesIds.length}
        isOpen={openSearchBar}
        messages={messages}
        findMessages={findMessages}
        scrollToFindMessageForward={scrollToFindMessageForward}
        scrollToFindMessageBackward={scrollToFindMessageBackward}
      /> */}
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
        {messages.slice().reverse().map((message) => {
          // const isLast = index === messages.length - 1;
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
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none text-black focus:border-blue-500"
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
          onClick={()=>handleSendMessageToGroup(input)}
          disabled={!input.length}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default GroupChatWindow;
