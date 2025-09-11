import React, { SetStateAction } from "react";
import { selectedChatType } from "../pages/Homepage";

interface AichatBotProps {
  selectedUser: selectedChatType | null;
  onSelectUser: React.Dispatch<SetStateAction<selectedChatType | null>>;
  setOpenContextMenu: (state: null) => void;
  setChatId: (state: string) => void;
}

const AiChatBot = ({
  selectedUser,
  onSelectUser,
  setOpenContextMenu,
  setChatId,
}: AichatBotProps) => {
  const user: selectedChatType = {
    name: "ChatBot",
    chatId: "ai-chat-bot",
    createdAt: new Date("2025-09-09"),
    email: "chatbot@example.com",
    id: "chat-bot",
    lastMessage: "Hello! I am your assistant.",
    lastMessageCreatedAt: "2025-09-09 12:30",
    profileUrl: "https://github.com/shadcn.png",
    refreshToken: "",
    tokenExpiresIn: null,
    unreadCount: {
      userId: "chat-bot",
      unreadMessages: 0,
    }
  };

  const handleContextMenu = (
    e: React.MouseEvent<HTMLLIElement, MouseEvent>
  ) => {};
  return (
    <div>
      <div className="relative w-full">
        <li
          className={`p-3 md:p-1 cursor-pointer  sm:w-full rounded-lg  b flex  ${
            selectedUser?.id === "chat-bot"
              ? "bg-[#008080d6] text-white"
              : "bg-gray-200"
          }`}
          onContextMenu={(e) => handleContextMenu(e)}
          onClick={() => {
            onSelectUser(user);
            setOpenContextMenu(null);
            setChatId(user.chatId);
          }}
        >
          <div className="flex w-[3rem] justify-start items-center gap-3">
            <img
              className="rounded-full h-9 w-9 object-cover"
              alt="chatbot"
              src="https://github.com/shadcn.png"
            />
          </div>
          <div className="flex flex-col justify-center w-full items-start px-3">
            <div className="flex justify-between w-full items-center gap-3">
              <div className="font-medium max-w-[10rem] text-primary2 overflow-hidden truncate">
                Chatbot
              </div>
              <div className="bg-green-500 rounded-3xl h-2 w-2"></div>
            </div>
            <div className={`text-sm flex justify-between w-full overflow-hidden truncate ${selectedUser?.chatId  === "ai-chat-bot" ? "text-gray-200" :"text-gray-500"} `}>
              <span className="max-w-[8rem] overflow-hidden truncate">
                Typing...
              </span>
              <div className="flex gap-1 justify-center items-center">
                <div className="text-white bg-blue-400 rounded-full h-4 w-4 flex items-center justify-center text-[0.6rem] p-2 text-center">
                  3
                </div>
                <span>12:30 PM</span>
              </div>
            </div>
          </div>
        </li>


      </div>
    </div>
  );
};

export default AiChatBot;
