import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { MdOutlineAttachment } from "react-icons/md";
import { IoMdSearch } from "react-icons/io";
import SearchBarForChat from "./components/SearchBarForChat";
import { UserType } from "./slices/userSlice";
import { toast } from "react-toastify";
export type MessageType ={
  id?:string
  senderId :String,
  receiverId:String,
  content:string,
  createdAt:number,
}

interface ChatWindowProps {
  ws:WebSocket | null,
  senderId:string,
  selectedUser:UserType,
  setSelectedUser:(state:null) =>void
  logedInUser:UserType
}

const ChatWindow = ({
  ws,
  senderId,
  selectedUser,
  setSelectedUser,
  logedInUser
}: ChatWindowProps) => {
  const [input, setInput] = useState<string>("");
  const chatWindowRef: React.RefObject<HTMLDivElement | null> = useRef(null);

  const [messages, setMessages] = useState<MessageType[] | []>([]);
  const [openSearchBar, setOpenSearchBar] = useState<boolean>(false);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [findMessagesIds, setFindMessagesIds] = useState<string[]>([]);
  const newMessage = (sender:string, content:string, receiver:string) => {
    return {
      senderId: sender,
      content: content,
      receiverId: receiver,
      createdAt: Date.now(),
    };
  };
  const sendMessage = async () => {
   if(!logedInUser.isLogin) return toast.error("Login first ") 
    if(!ws) return toast.error("server error!")
    ws.send(
      JSON.stringify({
        type: "personal-msg",
        message: input,
        receiverId: selectedUser.id,
        senderId,
      })
    );
    const msg = newMessage(senderId, input, selectedUser.id!);
    setMessages((prev) => [...prev, msg]);
    setInput("");

  };
useEffect(() =>{
  if(!logedInUser.isLogin){
    setMessages([])
    // setSelectedUser(null)
  }

},[logedInUser])
  useEffect(() => {
    if(!selectedUser) return
    const getChats = async () => {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL_HTTP}/chat/get-messages`, {
        params: {
          senderId: senderId,
          receiverId: selectedUser.id,
        },
      });
      if (res.status === 200) {
        setMessages([...res.data]);
      }
    };
    getChats();
    if(!ws) return
    ws.onmessage = (m) => {
      const data = JSON.parse(m.data);
      if (data.type === "personal-msg") {
        const msg = newMessage(data.senderId, data.message, data.receiverId);
        setMessages((prev) => [...prev, msg]);
      }
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
    setTimeout(() => {
      chatWindowRef.current?.scrollIntoView({ behavior: "instant" });
    }, 0);
  }, [messages]);

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

const setRefs = (el: HTMLElement | null, messageId: string, isLast: boolean) => {
    if (el) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      messageRefs.current[messageId] = el;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (isLast) chatWindowRef.current = el;
    }
  };

  const findMessages = (text:string) => {
    const findMessageIds = Object.keys(messageRefs.current).filter((id) =>
      messageRefs.current[id]?.textContent
        ?.toLocaleLowerCase()
        .includes(text.toLocaleLowerCase())
    );
    if (findMessageIds) {
      setFindMessagesIds(findMessageIds);
    }
  };
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
  return (
    <div className="flex relative  flex-col h-[100%] p-4 bg-[#1e1e2e] rounded-2xl  ">
      <div className=" px-4 bg-[#ffffffc6] h-10 rounded-sm flex justify-between items-center gap-3">
        <div className="flex justify-between items-center gap-3">
          <img
            src={selectedUser?.profileUrl}
            className="h-8 w-8 object-cover rounded-full"
            alt=""
          />
          <h1 className="text-black font-semibold" onClick={() =>setSelectedUser(null)}> {selectedUser?.name}</h1>
        </div>
        <div
          className="cursor-pointer"
          onClick={() => setOpenSearchBar(!openSearchBar)}
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
      <div className="flex-1 overflow-y-auto hide-scrollbar  mt-2 ">
        {messages.map((message, index) => {
          const isLast = index === messages.length - 1;
          return (
            <div
              key={message.id}
              ref={(el) => setRefs(el, message.id!, isLast)}
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
                {formatDate(message.createdAt)}
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

export default ChatWindow;
