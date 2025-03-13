import axios from "axios";
import { useEffect, useRef, useState } from "react";

const ChatWindow = ({ ws, user, senderId }: { ws: WebSocket }) => {
  const [input, setInput] = useState<string>("");
  const  chatWindowRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState([]);

  const newMessage = (sender, content, receiver) => {
    return {
      senderId: sender,
      content: content,
      receiverId: receiver,
      createdAt: Date.now()
    };
  };

  const sendMessage = () => {
    ws.send(
      JSON.stringify({
        type: "personal-msg",
        message: input,
        receiverId: user.id,
        senderId,
      })
    );
    const msg = newMessage(senderId, input, user.id);
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  useEffect(() => {
    const getChats = async () => {
      const res = await axios.get("http://localhost:8000/chat/get-messages", {
        params: {
          senderId: senderId,
          receiverId: user.id,
        },
      });
      if (res.status === 200) {
        setMessages([...res.data]);
      }
    };
    getChats();
    ws.onmessage = (m) => {
      const data = JSON.parse(m.data);
      if (data.type === "personal-msg") {
        const msg = newMessage(data.senderId, data.message, data.receiverId);
        setMessages((prev) => [...prev, msg]);
      }
    };
  }, [user]);

  const formatDate = (newDate:string) => {
    const date = new Date(newDate);

    const options = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    const formattedTime = date.toLocaleTimeString("en-US", options);

    return formattedTime;
  };
useEffect(() =>{
  chatWindowRef.current?.scrollIntoView({behavior:"smooth"})
},[messages])

const handleKeyDown = (e:any) =>{
  if(e.key === "Enter"){
    sendMessage();
  }
}

  return (
    <div className="flex flex-col h-[90%] p-4" >
      <div className="flex-1 overflow-y-auto" >
        {messages.map((message) => (
          <div
          ref={chatWindowRef}
            key={message}
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
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          value={input}
          type="text"
          placeholder="Type a message..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
        <button
          className="ml-2 p-2 bg-blue-500 hover:bg-blue-700 text-white
        rounded-lg focus:outline-none focus:bg-blue-700"
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
