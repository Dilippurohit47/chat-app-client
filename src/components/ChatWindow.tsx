import { axios } from "../apiClient";;
import { useEffect, useRef, useState } from "react";
import { MdOutlineAttachment } from "react-icons/md";
import { IoMdSearch } from "react-icons/io";
import SearchBarForChat from "../components/SearchBarForChat";
import { UserType } from "../slices/userSlice";
import { toast } from "react-toastify";
import {v4 as uuid} from "uuid"
import { RxCross2 } from "react-icons/rx";

import { BiSolidSend } from "react-icons/bi";
import { useWebSocket } from "../context/webSocket";
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

interface ChatWindowProps {
  ws: WebSocket | null;
  senderId: string;
  selectedUser: selectedChat;
  setSelectedUser: (state: null) => void;
  logedInUser: UserType;
  chatId:string;
}

const ChatWindow = ({
  senderId,
  selectedUser,
  setSelectedUser,
  logedInUser,
  chatId,
  messages,
  setMessages,
}: ChatWindowProps) => {
  const [input, setInput] = useState<string>("");
  const chatWindowRef: React.RefObject<HTMLDivElement | null> = useRef(null);
const {ws:websocket} = useWebSocket()
const ws = websocket.current
  const [openSearchBar, setOpenSearchBar] = useState<boolean>(false);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [findMessagesIds, setFindMessagesIds] = useState<string[]>([]);
  const [cursorId, setCursorId] = useState<string | null>(null);
  const [loadingMoreChat,setLoadingMoreChat] = useState<boolean>(false)
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [hasMoreMsg,setHasMoreMsg] = useState<boolean>(false)
  const [initialLoad ,setInitialLoad] = useState(true)
  const messageInputRef = useRef<HTMLInputElement | null>(null)
const  [mediaFile,setMediaFile] = useState([])
const [sendedFiles,setSendedFiles] = useState([])

function newMessage({
  senderId,
  content,
  receiverId,
  tempId,
  isMedia = false,
  uploading = false,
  error = false
}: {
  senderId: string;
  content: string;
  receiverId: string;
  tempId?: string;
  uploading?:boolean;
  isMedia?: boolean;
  error?:boolean;
}) {

    return {
      tempId:tempId || 0,
      senderId: senderId,
      content: content,
      receiverId: receiverId,
      chatId:chatId,
      createdAt: Date.now(),
      isMedia:isMedia,
      uploading:uploading,
      error:error
    };
  };
  const sendMessage = async () => {
    if (!logedInUser.isLogin) return toast.error("Login first ");
    if (!ws) return toast.error("server error!");
if(sendedFiles.length <= 0){
      ws.send(
      JSON.stringify({
        type: "personal-msg",
        message: input,
        receiverId: selectedUser.id,
        senderId,
        chatId,
      })
    );
}

    if(sendedFiles.length > 0){
    sendedFiles.forEach(async(img) =>{
      const tempId = uuid()
        const msg = newMessage({senderId, content:img.url, receiverId:selectedUser.id!,isMedia:true ,tempId:tempId,error:false ,uploading:true});
    setMessages((prev) => [msg,...prev]);
    setMediaFile((prev) =>prev.filter((img) => img.imageId !== img.imageId))

   const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL_HTTP}/aws/get-presigned-url-s3-media`,
        {},
        {
          withCredentials: true,
        }
      );
      if(res.status === 200){
        const signedInUrl = res.data.url
        const uploadedToAws =  await axios.put(signedInUrl,img.file,{headers:{"Content-Type":img.file.type}}) 
        if(uploadedToAws.status !== 200){
          console.log("failed to upload iamge",uploadedToAws)
          setSendedFiles((prev) =>prev.filter((img) =>img.imageId !== img.imageId))

               setMessages((prev) =>prev.map((msg) => {
            if(msg?.tempId === tempId){
              return {
                ...msg,
                uploading:false,
                error:true
              }
            }else{
               return msg
            }
          }))

        }else{
          console.log("image successfully uploaed to s3")
             ws.send(
      JSON.stringify({
        type: "personal-msg",
        message: signedInUrl?.split("?")[0],
        receiverId: selectedUser.id,
        senderId,
        chatId,
        isMedia:true
      })
    );

          setSendedFiles((prev) =>prev.filter((img) =>img.imageId !== img.imageId))
                setMessages((prev) =>prev.map((msg) => {
            if(msg?.tempId === tempId){
              return {
                ...msg,
                uploading:false,
                error:false
              }
            }else{
               return msg
            }
          }))
        }
      }
    })

    }else{
        const msg = newMessage({senderId, content:input, receiverId:selectedUser.id!,isMedia:false ,tempId:"0",error:false,uploading:false});

    setMessages((prev) => [msg,...prev]);

    }
  
    setInput("");
  };
  useEffect(() => {
    if (!logedInUser.isLogin) {
      setMessages([]);
    }
  }, [logedInUser]);

  useEffect(() => {
    if (!selectedUser) return;
    // chatWindowRef.current?.scrollIntoView({ behavior: "instant" });
    const getChats = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL_HTTP}/chat/get-messages`, {
          params: {
            senderId: senderId,
            receiverId: selectedUser.id,
            limit: 20,
            cursor: undefined,
          },
        });
        if (res.status === 200) {

          setMessages(res.data.messages);
          setCursorId(res.data.cursor);
          setHasMoreMsg(res.data.hasMore);
        }
      } catch (error) { 
        console.log(error);
      }
    };

    const updateUnreadCount = async () => {
      const res = await axios.put(
        `${import.meta.env.VITE_BASE_URL_HTTP}/chat/update-unreadmessage-count`,
        {
          userId: logedInUser.id,
          chatId: selectedUser.chatId,
        }
      );
    };

    if(messageInputRef.current){
      messageInputRef.current.focus()
    }

    setInitialLoad(true)
    getChats();
    updateUnreadCount();
    setOpenSearchBar(false);
  }, [selectedUser]);

  useEffect(() => {
    if (!messageContainerRef.current) return;
    const handleScroll = async () => {
      const container = messageContainerRef.current;
      if (container.scrollTop === 0 && cursorId && hasMoreMsg) {
        setLoadingMoreChat(true);
        try {
          const scrollHeightBefore = container.scrollHeight;
          const scrollTopBefore = container.scrollTop;
          const res = await axios.get(`${import.meta.env.VITE_BASE_URL_HTTP}/chat/get-messages`, {
            params: {
              senderId: senderId,
              receiverId: selectedUser.id,
              limit: 20,
              cursor: JSON.stringify(cursorId),
            },
          });
          if (res.status === 200) {
            setMessages(prev => [ ...prev, ...res.data.messages]);
            setCursorId(res.data.cursor);
            setHasMoreMsg(res.data.hasMore);
            requestAnimationFrame(() => {
              if (messageContainerRef.current){
              container.scrollTop = container.scrollHeight - scrollHeightBefore + scrollTopBefore;
              } 
            });
          }
        } catch (error) {
          console.log(error);
        } finally {
          setLoadingMoreChat(false);
        }
      }
    };
    messageContainerRef.current.addEventListener("scroll", handleScroll);
    return () => {
      messageContainerRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, [selectedUser, cursorId, hasMoreMsg]);


useEffect(() =>{
  if(!chatWindowRef.current || !initialLoad) return
  chatWindowRef.current?.scrollIntoView({ behavior: "instant" });
  setInitialLoad(false)
},[messages])
  useEffect(() => {
    if (!ws || !selectedUser) return;
    const getMessage = (m) => {
      const data = JSON.parse(m.data);
      if (data.type === "personal-msg") {
        console.log(data)
        if (
          (data.receiverId === logedInUser.id &&
            data.senderId === selectedUser.id) ||
          (data.senderId === logedInUser.id &&
            data.receiverId === selectedUser.id)
        ) {
        const msg = newMessage({senderId:data.senderId, content:data.message, receiverId:data.receiverId,isMedia:data.isMedia ,tempId:"0",error:false,uploading:false});

          setMessages((prev) => [msg,...prev]);
        }
      }
    };
    ws.addEventListener("message", getMessage);

    return () => {
      ws.removeEventListener("message", getMessage);
    };
  }, [selectedUser]);
  const formatDate = (newDate: number) => {
    const date = new Date(newDate);

    const options = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const formattedTime = date.toLocaleTimeString("en-US", options);

    return formattedTime;
  };
  useEffect(() => {
    const updateUnreadCount = async () => {
      const res = await axios.put(
        `${import.meta.env.VITE_BASE_URL_HTTP}/chat/update-unreadmessage-count`,
        {
          userId: logedInUser.id,
          chatId: selectedUser.chatId,
        }
      );

    };
    updateUnreadCount();
  }, [messages]);

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };
  const setRefs = (
    el: HTMLElement | null,
    messageId: string,
    isLast: boolean
  ) => {
    if (el) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      messageRefs.current[messageId] = el;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (isLast) chatWindowRef.current = el;
    }
  };

  const findMessages = (text: string) => {
    const findMessageIds = Object.keys(messageRefs.current).filter((id) =>
      messageRefs.current[id]?.textContent
        ?.toLocaleLowerCase()
        .includes(text.toLocaleLowerCase())
    );
    if (findMessageIds) {
      setFindMessagesIds(findMessageIds);
    }
  };


  useEffect(() => {
    const container = messageContainerRef.current;
    if (!container) return;
  

    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 500;
    if (isNearBottom && messages.length > 0) {
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 0);
    }
  }, [messages]); 
  
  const [messageIndex, setMessageIndex] = useState<number | null>(null);
  const scrollToFindMessageForward = () => {
    if (findMessagesIds.length === 0) return;
    setMessageIndex((prevIndex) => {
      const newIndex =
        prevIndex === null ? findMessagesIds.length - 1 : prevIndex - 1;
      if (newIndex >= 0) {
        const messageId = findMessagesIds[newIndex];
        messageRefs?.current[messageId]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return newIndex >= 0 ? newIndex : prevIndex;
    });
  };

  const scrollToFindMessageBackward = () => {
    if (findMessagesIds.length === 0) return;
    setMessageIndex((prevIndex) => {
      const newIndex = prevIndex === null ? 0 : prevIndex + 1;

      if (newIndex < findMessagesIds.length) {
        const messageId = findMessagesIds[newIndex];
        messageRefs?.current[messageId]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return newIndex < findMessagesIds.length ? newIndex : prevIndex;
    });
  };

const handleFileChange = (e) => {
  const files = Array.from(e.target.files || []); 
  const uniqueId = uuid()
setMediaFile((prev) => [
  ...prev,
  ...files.map((file) => ({
    imageId: uniqueId,
    url: URL.createObjectURL(file)
  }))
]);

const mappedFiles = files.map((f) => ({
  imageId: uniqueId,
  file: f,  
  url:URL.createObjectURL(f)
}));

setSendedFiles((prev) => [...prev,...mappedFiles])


};

const removeImage =(image) =>{
  setMediaFile((prev) =>prev.filter((img) => img.imageId !== image.imageId))

  setSendedFiles((prev) =>prev.filter((file) => {
    return file.imageId !== image.imageId
  }))
}
console.log(messages)
  return (
    <div className="flex  relative    md:h-full   flex-col h-[100%] p-4 bg-[#1e1e2e] rounded-2xl md:p-0  md:rounded-[0] ">
      <div className=" px-4 bg-[#ffffffc6] h-10 rounded-sm flex justify-between items-center gap-3">
        <div className="flex justify-between items-center gap-3">
          <img
           src={selectedUser?.profileUrl ? selectedUser.profileUrl : "https://github.com/shadcn.png"}
            className="h-8 w-8 object-cover rounded-full"
            alt=""
          />
          <h1
            className="text-black font-semibold"
            onClick={() => setSelectedUser(null)}
          >
            {" "}
            {selectedUser?.name}
          </h1>
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
      <SearchBarForChat
        messageIndex={messageIndex}
        totalFindmessages={findMessagesIds.length}
        isOpen={openSearchBar}
        messages={messages}
        findMessages={findMessages}
        scrollToFindMessageForward={scrollToFindMessageForward}
        scrollToFindMessageBackward={scrollToFindMessageBackward}
      />
 {
  loadingMoreChat &&  <div className="flex justify-center ">
  <svg className="loader" viewBox="25 25 50 50">
  <circle r="20" cy="50" cx="50"></circle>
</svg>
  </div>
 }
      <div
        ref={messageContainerRef}
        className="flex-1 md:flex-none overflow-y-auto hide-scrollbar md:px-1 md:py-1   mt-2  md:h-[75vh]  "
      >
        {messages.slice().reverse().map((message, index) => {
          const isLast = index === messages.length - 1;
          return (
            <div 
              key={message.id}
              ref={(el) => setRefs(el, message.id!, isLast)}
              className={`mb-4 flex    gap-2 ${
                message.senderId === senderId ? "justify-end" : "justify-start"
              }`}
            >
          <div> 
               {
              message.isMedia ? <div className="relative   "> <img
              src={message.content}
                className={`block  rounded-lg object-cover ${
                  message.senderId === senderId
                    ? " h-[200px] w-[200px]"
                    : " h-[200px] w-[200px]"
                }
              `}
              
              />
  {
    message?.uploading && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
  <div className="w-10 h-10 border-4 border-t-green-600 border-gray-300 rounded-full animate-spin"></div>
</div>

  }
              </div>
              :  <div
                className={`inline-block p-3 rounded-lg ${
                  message.senderId === senderId
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }
              `}
              >
                {message.content}
              </div>

             }
              <div className="text-xs  text-end text-gray-500 mt-1">
                {formatDate(message.createdAt)}
              </div>
          </div>
            </div>

            
          );
        })}
      </div>
      <div className="mt-4 flex gap-2 justify-center items-center md:p-2 md:mt-2 md:absolute bottom-0  md:w-full sm:gap-1 ">
        {
          mediaFile.length <= 0 ? <input
          value={input}
          type="text"
          placeholder="Type a message..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-3 border sm:p-2  border-gray-300 rounded-lg focus:outline-none text-black focus:border-blue-500"
          ref={messageInputRef}
        />

 : 
 <div
          className="w-full  border p-2  gap-4 flex justify-start rounded-lg focus:outline-none bg-white text-black focus:border-blue-500"
 
 > 
{
  mediaFile?.map((img ,index) =>{
   return   <div className="relative inline-block " key={index}>
   <img
 src={img.url}
          className=" h-20 w-20 border object-cover relative  rounded-lg "
        />
       <div className="absolute top-1 right-1 cursor-pointer " onClick={() =>removeImage(img)}>
         <RxCross2 className="text-white"/>
        </div>
  </div>
  })
}
</div>
        }
        <label htmlFor="file-input">
          <MdOutlineAttachment
            className="text-gray-300 rotate-120 hover:text-gray-500 cursor-pointer text-[1.8rem] sm:text-[1.5rem] sm:hover:text-gray-300"
          />
        </label>
        <input
          id="file-input"
          type="file"
          className="hidden w-0 h-0"
          onChange={handleFileChange}
          multiple
        />
        <button
          className="ml-2 p-2 bg-blue-500 hover:bg-blue-700 text-white
        rounded-lg focus:outline-none  focus:bg-blue-700 cursor-pointer text-[1.3rem] sm:text-sm md:bg-gray-500 sm:hover:bg-gray-500"          onClick={sendMessage}
          disabled={!input.length && !mediaFile.length}
        >
        <BiSolidSend />
        </button>
      </div>
    </div>
  );
};
export default ChatWindow;
