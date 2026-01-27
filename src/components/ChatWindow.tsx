import { axios } from "../apiClient";
import { useEffect, useRef, useState } from "react";
import { MdOutlineAttachment } from "react-icons/md";
import { IoMdSearch } from "react-icons/io";
import SearchBarForChat from "../components/SearchBarForChat";
import { UserType } from "../slices/userSlice";
import { toast } from "react-toastify";
import { v4 as uuid } from "uuid";
import { RxCross2 } from "react-icons/rx";
import { BiSolidSend } from "react-icons/bi";
import { useWebSocket } from "../context/webSocket";
import { MdArrowBackIosNew } from "react-icons/md";
import {  LuLoaderCircle, LuPhoneCall } from "react-icons/lu";
import VideoCallDialog from "./VideoCallDialog";
import { MessageType, selectedChatType } from "../types";
import { useChatMessages } from "../Chat/hooks/useChatMessages";
import { getReceiverMessage, getSenderMessage } from "../Chat/utils/encryption";
import { useChatSocket } from "../Chat/hooks/useChatSocket";
import { uploadMediaToS3 } from "../lib/uploadMediaToS3";
import { useSyncOfflineMessage } from "../Chat/hooks/useSyncOfflineMessage";
import { newMessage } from "../Chat/utils/createNewMessage";
import { useTypingIndicator } from "../Chat/hooks/useTypingIndicator";
import { useSearchMessages } from "../Chat/hooks/useSearchMessage";

interface ChatWindowProps {
  ws: WebSocket | null;
  senderId: string;
  selectedUser: selectedChatType;
  setSelectedUser: (state: null) => void;
  logedInUser: UserType;
  chatId: string;
  messages: MessageType[];
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  selectedTab: string;
}
interface sendedFileType {
  imageId: string;
  file: File;
  url: string;
}
interface MediaFileType {
  imageId: string;
  url: string;

}

  interface Msg {
    selectedUserId: string;
    input: string;
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
  const { ws: websocket } = useWebSocket();
  const ws: WebSocket | null = websocket.current;
  const [openSearchBar, setOpenSearchBar] = useState<boolean>(false);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const messageInputRef = useRef<HTMLInputElement | null>(null);
  const [mediaFile, setMediaFile] = useState<MediaFileType[] | []>([]);
  const [sendedFiles, setSendedFiles] = useState<sendedFileType[] | []>([]);
  const [inputPlaceHolder, SetInputPlaceHolder] =useState<string>("Type a message");
  const placeHolderSetterInterval = useRef<ReturnType<
    typeof setInterval
  > | null>(null);
  const [callUserId, setCallUserId] = useState<string | null>(null);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [chatBotResponseLoading , setChatBotResponseLoading]  = useState<boolean>(false) 
  const  [systemError,setSystemError] = useState('Currently facing api error in your region sorry for inconvience')


  const incompletInputMsgRef = useRef<Msg[]>([]);


  const {loadInitialMessages , loadMoreMessages , loadingMoreMessages} = useChatMessages({senderId:logedInUser.id , receiverId:selectedUser.id , setMessages:setMessages})

  const {sendMessageToBot  ,sendMessageToUser  ,sendMedia} = useChatSocket({ws:ws , senderId:logedInUser.id ,setMessages:setMessages ,selectedUser:selectedUser , messages:messages })

  const {savePendingOfflineMessages} = useSyncOfflineMessage({ws:ws,senderId})

  const  {userIsTyping , typingStop} = useTypingIndicator({ws,senderId,receiverId:selectedUser.id})

  const {setRefs ,messageIndex  ,findMessages  , findMessagesIds , setFindMessagesIds  ,clickToFindMessageBackward , clickToFindMessageForward} = useSearchMessages({messages , chatWindowRef})


  const sendMessage = async () => {
    if (!logedInUser.isLogin ) return toast.error("Login first ");
   
     const receiverContent = await getReceiverMessage({text:input , publickey:selectedUser.publickey})
    const senderContent = await getSenderMessage({text:input,publickey:logedInUser.publickey!})
    let tempId = uuid()
    // offline save message 
    if (!navigator.onLine) {
      if(!receiverContent || !senderContent) return
      const msg:MessageType = newMessage({
        senderId,
        receiverContent: input,
        senderContent: input, 
        receiverId: selectedUser.id,
        isMedia: false,
        tempId: tempId,
        error: false,
        uploading: false,
      status:"pending",
      chatId:chatId,
      });

   savePendingOfflineMessages(msg , receiverContent , senderContent)
      setMessages((prev) => [msg, ...prev]);
      setInput("");
      return;
    }
    if (!ws) return toast.error("server error!");
      if (selectedUser.id === "chat-bot") {
        setChatBotResponseLoading(true)
        sendMessageToBot(input)
        return
      }
    if (sendedFiles.length <= 0) {
      if(!receiverContent  || !senderContent){
        window.alert(" encryption Failed try again")
        return
      }
    sendMessageToUser({receiverContent , senderContent,chatId , tempId ,receiverId:selectedUser.id})
    }

    if (sendedFiles.length > 0) {
      sendedFiles.forEach(async (img) => {
        const tempId: string = uuid();
        const msg = newMessage({
          senderId,
          receiverContent: img.url,
          senderContent:img.url,
          receiverId: selectedUser.id!,
          isMedia: true,
          tempId: tempId,
          error: false,
          uploading: true,
      status:"pending",
      chatId:chatId
        });
        setMessages((prev) => [msg, ...prev]);

        setMediaFile((prev) =>
          prev.filter((img) => img.imageId !== img.imageId)
        );

    try {           
          const signedInUrl =   await uploadMediaToS3(img) 
            sendMedia({signedInUrl:signedInUrl , receiverId:selectedUser.id , chatId:chatId})

            setSendedFiles((prev) =>
              prev.filter((img) => img.imageId !== img.imageId)
            );
            setMessages((prev) =>
              prev.map((msg) => {
                if (msg?.tempId === tempId) {
                  return {
                    ...msg,
                    uploading: false,
                    error: false,
                  };
                } else {
                  return msg;
                }
              })
            );
        
    } catch (error) {
      console.log("Error in uplaoding image",error)
            setSendedFiles((prev) =>
              prev.filter((img) => img.imageId !== img.imageId)
            );

            setMessages((prev) =>
              prev.map((msg) => {
                if (msg?.tempId === tempId) {
                  return {
                    ...msg,
                    uploading: false,
                    error: true,
                    errorMessage:"Retry"
                  };
                } else {
                  return msg;
                }
              })
            );
    }
      });
    } 
    
    else {
      const msg = newMessage({
        senderId,
        receiverContent: input,
        senderContent:input,
        receiverId: selectedUser.id!,
        isMedia: false,
        tempId: tempId,
        error: false,
        uploading: false,
      status:"pending",
      chatId:chatId,
      });

      if(selectedUser.id === "chat-bot"){
        
             const stringOldMessagesArray = sessionStorage.getItem("chat-bot-messages")
          if(stringOldMessagesArray){
          const oldMessages = JSON.parse(stringOldMessagesArray)
          sessionStorage.setItem("chat-bot-messages",JSON.stringify([...oldMessages  , msg ]))
          }else{
          sessionStorage.setItem("chat-bot-messages",JSON.stringify([msg]))
          }
      }
      setMessages((prev) => [msg, ...prev]);
    }

    incompletInputMsgRef.current = incompletInputMsgRef.current.map((inc) => {
      if (inc.selectedUserId === selectedUser.id) {
        return {
          ...inc,
          input: "",
        };
      } else {
        return inc;
      }
    });

    setInput("");
  };
  useEffect(()=>{
    loadInitialMessages()
  },[selectedUser])

  useEffect(() => {
    if (placeHolderSetterInterval.current) {
      clearInterval(placeHolderSetterInterval.current);
      placeHolderSetterInterval.current = null;
    }

    if (!selectedUser) {
      SetInputPlaceHolder("Greet your friend...");
      setInput("");
      return;
    }
    if (selectedUser.id === "chat-bot") {
      const placeHolders = [
        "Tell me about your projects",
        "What is your experience",
        "what is your qualifications",
      ];
      let usedPlaceholder = 0;
      if (placeHolderSetterInterval.current === null) {
        placeHolderSetterInterval.current = setInterval(() => {
          SetInputPlaceHolder(placeHolders[usedPlaceholder]);
          if (usedPlaceholder >= 2) {
            usedPlaceholder = 0;
          } else {
            usedPlaceholder = usedPlaceholder + 1;
          }
        }, 2000);
      }
    } else {
      if (placeHolderSetterInterval.current !== null) {
        clearInterval(placeHolderSetterInterval.current);
        placeHolderSetterInterval.current = null;
      }
      SetInputPlaceHolder("Type a message");
    }
 
    if (!selectedUser) return;
    const incompleteInput = incompletInputMsgRef.current.find(
      (inc) => inc.selectedUserId === selectedUser.id
    );

    if (incompleteInput) {
      setInput(incompleteInput?.input);
    }
    if (!incompleteInput) {
      setInput("");
    }
    const getChats = async () => {
      if(selectedUser.id === "chat-bot"){
        const chatBotsMessagesRawString = sessionStorage.getItem("chat-bot-messages")
        if(!chatBotsMessagesRawString){
          setMessages([])
        }
        if(chatBotsMessagesRawString) {
          const chatBotMessages = JSON.parse(chatBotsMessagesRawString)
          setMessages(chatBotMessages.reverse())
        }
      }

    };

    const updateUnreadCount = async () => {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL_HTTP}/chat/update-unreadmessage-count`,
        {
          userId: logedInUser.id,
          chatId: selectedUser.chatId,
        }
      );
    };

  
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }

    if (prevConversationRef.current) {
      if (!ws) return;
      ws.send(
        JSON.stringify({
          receiverId: prevConversationRef.current,
          type: "typing-stop",
          senderId: logedInUser.id,
        })
      );
      prevConversationRef.current = "";
    }

    setInitialLoad(true);
    getChats();
    updateUnreadCount();
    setOpenSearchBar(false);

    return () => {
      if (placeHolderSetterInterval.current) {
        clearInterval(placeHolderSetterInterval.current);
        placeHolderSetterInterval.current = null;
      }
    };
  }, [selectedUser]);



  useEffect(() => {
    if (!messageContainerRef.current) return;
    const handleScroll = async () => {
      const container = messageContainerRef.current;
      if (!container) return;
      if (container.scrollTop === 0 && !loadingMoreMessages ) {
          const scrollHeightBefore = container.scrollHeight;
          await loadMoreMessages()
         requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    container.scrollTop = container.scrollHeight - scrollHeightBefore;
  });
});
      }
    };
    messageContainerRef.current.addEventListener("scroll", handleScroll);
    return () => {
      messageContainerRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, [loadMoreMessages , loadingMoreMessages]);

  useEffect(() => {
    if (!chatWindowRef.current || !initialLoad) return;
    chatWindowRef.current?.scrollIntoView({ behavior: "instant" });
    setInitialLoad(false);
  }, [messages]);


  useEffect(() => {
    if (!selectedUser) return;
    const handleClickOutSideMessageInput = (e: MouseEvent) => {
      if (
        messageInputRef.current &&
        !messageInputRef.current.contains(e.target as Node)
      ) {
        typingStop();
      }
    };

    window.addEventListener("click", handleClickOutSideMessageInput);

    return () => {
      window.removeEventListener("click", handleClickOutSideMessageInput);
    };
  }, [selectedUser]);


  const formatDate = (newDate: number) => {
    const date = new Date(newDate);

    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    const formattedTime = date.toLocaleTimeString("en-US", options);

    return formattedTime;
  };
  useEffect(() => {
    const updateUnreadCount = async () => {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL_HTTP}/chat/update-unreadmessage-count`,
        {
          senderId: selectedUser.id,
          chatId: selectedUser.chatId,
          receiverId:logedInUser.id
        }
      );
    };
    updateUnreadCount();
  }, [messages]);


  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      sendMessage();
      typingStop();
    }
  };


  useEffect(() => {
    const container = messageContainerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      500;
    if (isNearBottom && messages.length > 0) {
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 0);
    }
  }, [messages]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const uniqueId = uuid();

    setMediaFile((prev) => [
      ...prev,
      ...files.map((file) => ({
        imageId: uniqueId,
        url: URL.createObjectURL(file),
      })),
    ]);

    const mappedFiles = files.map((f) => ({
      imageId: uniqueId,
      file: f,
      url: URL.createObjectURL(f),
    }));

    setSendedFiles((prev) => [...prev, ...mappedFiles]);
  };

  const removeImage = (imageId: string) => {
    setMediaFile((prev) => prev.filter((img) => img.imageId !== imageId));

    setSendedFiles((prev) =>
      prev.filter((file) => {
        return file.imageId !== imageId;
      })
    );
  };

  const prevConversationRef = useRef("");
 


  return (
    <div className="flex  relative overflow-hidden    md:h-full   flex-col h-[100%] max-md:p-4 p-2 bg-[#1e1e2e] max-md:rounded-2xl md:p-0  md:rounded-[0] ">

     
      <div className=" pr-2 pl-2 relative max-md:px-4 bg-[#ffffffc6] h-10 rounded-sm flex justify-between items-center gap-3">
        <div className="flex justify-between items-center gap-2">
          <div onClick={() => {setSelectedUser(null)  ;console.log("clicked")}} className="cursor-pointer">
            <MdArrowBackIosNew size={24} />
          </div>
          <img
            src={
              selectedUser?.profileUrl
                ? selectedUser.profileUrl
                : "https://github.com/shadcn.png"
            }
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
        <div className="flex justify-center pr-4 items-center gap-4  relative">
          <div
            className="cursor-pointer "
            onClick={() => {
              setIsCallOpen(true);
              setCallUserId(selectedUser.id);
            }}
          >
            <LuPhoneCall size={20} />
          </div>


<div className="relative ">
          <div
            className="cursor-pointer relative "
            onClick={() => {
              setOpenSearchBar(!openSearchBar), setFindMessagesIds([]);
            }}
          >
            <IoMdSearch size={24} />
          </div>
      <SearchBarForChat
        messageIndex={messageIndex}
        totalFindmessages={findMessagesIds.length}
        isOpen={openSearchBar}
        messages={messages}
        findMessages={findMessages}
        scrollToFindMessageForward={clickToFindMessageForward}
        scrollToFindMessageBackward={clickToFindMessageBackward}
      />

</div>

        </div>
      </div>
     
    {selectedUser.id === "chat-bot" &&
  systemError && (
    <div className="mt-2 hidden rounded-md bg-red-200 border border-red-300 font-semibold text-red-800 px-3 py-2 text-sm">
      {systemError}
    </div>
  )
}

       {isCallOpen && callUserId === selectedUser.id && (
        <VideoCallDialog
          logedInUser={logedInUser}
          setCall={setCallUserId}
          setIsCallOpen={setIsCallOpen}
          call={callUserId}
          selectedUserId={selectedUser.id}
        />
      )}
      {loadingMoreMessages && (
        <div className="flex justify-center ">
          <svg className="loader" viewBox="25 25 50 50">
            <circle r="20" cy="50" cx="50"></circle>
          </svg>
        </div>
      )}
      <div
        ref={messageContainerRef}
        className="flex-1 md:flex-none overflow-y-auto hide-scrollbar md:px-1 md:py-1   mt-2  md:h-[75vh]  "
      >
        {messages
          .slice()
          .reverse()
          .map((message, index) => {
            const isLast = index === messages.length - 1;
            return (
              <div
                key={message.id || message.tempId}
                ref={(el) => setRefs(el, message.id!, isLast)}
                className={`mb-4 flex  min-w-0    md:text-start gap-2 break-words sm:max-w-[90vw] ${
                  message.senderId === senderId
                    ? "justify-end "
                    : "justify-start  max-md:max-w-[70%]  "
                }`}
              >
                <div className=" flex flex-col text-wrap  justify-end items-end   max-w-[30vw]">
                  {message.isMedia ? (
                    <div className="relative   ">
                      {" "}
                      <img
                        src={message.receiverContent}
                        className={`block  sm:max-w-[90vw]  rounded-lg object-cover  ${
                          message.senderId === senderId
                            ? " h-[200px] w-[200px]"
                            : " h-[200px] w-[200px]"
                        }
              `}
                      />
                      {message?.uploading && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <div className="w-10 h-10 border-4 border-t-green-600 border-gray-300 rounded-full animate-spin"></div>
                        </div>
                      )}{
                        message?.error &&  <div className="text-red-500">
                          failed try again later 
                          </div>
                      }

                    </div>
                  ) : (
<>
             
        <div
  className={`max-w-full break-words whitespace-pre-wrap overflow-wrap-anywhere
    message-bubble p-3 rounded-lg
    ${
      message.senderId === senderId
        ? "bg-blue-500 text-white"
        : "bg-gray-200 text-gray-800"
    }`}
>
  {message.senderId === senderId
    ? message.senderContent
    : message.receiverContent}
</div>
</>
                  )} 
                  <div className={`text-xs w-full   flex  text-gray-400   mt-1 ${message.senderId === senderId ? "justify-end text-start" : "justify-start"}`}>
                  {message.senderId === senderId && message.status } {formatDate(message.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
        { selectedUser.id === "chat-bot"  && chatBotResponseLoading &&   <div className="text-black px-3 py-3 rounded-md text-start bg-gray-200    w-[fit-content]">
            <LuLoaderCircle className="animate-spin" />
          </div>
        }
      </div>
      <div className="mt-4  flex gap-2 justify-center items-center md:p-2 md:mt-2 md:absolute bottom-0  md:w-full sm:gap-1 ">
        {mediaFile.length <= 0 ? (
          <input
            value={input}
            type="text"
            placeholder={inputPlaceHolder}
            onChange={(e) => {
              userIsTyping(), setInput(e.target.value);
              const existing = incompletInputMsgRef.current.find(
                (inc) => inc.selectedUserId === selectedUser.id
              );

              if (existing) {
                existing.input = e.target.value;
              } else {
                incompletInputMsgRef.current.push({
                  selectedUserId: selectedUser.id,
                  input: e.target.value,
                });
              }
            }}
            onKeyDown={handleKeyDown}
            className="w-full p-3 border sm:p-2  border-gray-300 rounded-lg focus:outline-none text-black focus:border-blue-500"
            ref={messageInputRef}
          />
        ) : (
          <div className="w-full  border p-2  gap-4 flex justify-start rounded-lg focus:outline-none bg-white text-black focus:border-blue-500">
            {mediaFile?.map((img, index) => {
              return (
                <div className="relative inline-block " key={index}>
                  <img
                    src={img.url}
                    className=" h-20 w-20 border object-cover relative  rounded-lg "
                  />
                  <div
                    className="absolute top-1 right-1 cursor-pointer "
                    onClick={() => removeImage(img.imageId)}
                  >
                    <RxCross2 className="text-white" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {selectedUser.id !== "chat-bot" && (
          <label htmlFor="file-input">
            <MdOutlineAttachment className="text-gray-300 rotate-120 hover:text-gray-500 cursor-pointer text-[1.8rem] sm:text-[1.5rem] sm:hover:text-gray-300" />
          </label>
        )}
        <input
          id="file-input"
          type="file"
          className="hidden w-0 h-0"
          onChange={handleFileChange}
          multiple
        />
        <button
          className="ml-2 p-2 bg-blue-500 hover:bg-blue-700 text-white
        rounded-lg focus:outline-none  focus:bg-blue-700 cursor-pointer text-[1.3rem] sm:text-sm md:bg-gray-500 sm:hover:bg-gray-500"
          onClick={() => {
            typingStop(), sendMessage();
          }}
          disabled={!input.length && !mediaFile.length}
        >
          <BiSolidSend />
        </button>
      </div>
    </div>
  );
};
export default ChatWindow;
