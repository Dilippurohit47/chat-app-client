import { useSelector } from "react-redux";
import { RootState } from "./store";
import { useEffect, useState } from "react";
import axios from "axios";

interface UserListProps {
  users: any[];
  selectedUser: any;
  onSelectUser: (userId: string) => void;
  totalUsers: number;
  connected: boolean;
  onlineUsers: Object[] | undefined;
  heading: string;
  ws: WebSocket;
}

const UserList = ({
  users,
  logedInUser,
  selectedUser,
  onSelectUser,
  connected,
  ws,
  onlineUsers,
}: UserListProps) => {
  const [recentChatUsers, setRecentChatUsers] = useState([]);

  useEffect(() => {
    const getTotalUsers = async () => {
      const res = await axios.get(
        "http://localhost:8000/chat/get-recent-chats",
        { params: { userId: logedInUser.id }, withCredentials: true }
      );
      if (res.status === 200) {
        setRecentChatUsers(res.data.chats);
      }
    };
    getTotalUsers();
  }, [logedInUser]);

  useEffect(() => {
    if (!ws) return;
    const messageHandler = (m) => {
      const data = JSON.parse(m.data);
      if (data.type === "recent-chats") {
        setRecentChatUsers(data.chats);
      }
    };
    ws.addEventListener("message", messageHandler);
    return () => {
      console.log("Cleaning up previous WS listener");
      ws.removeEventListener("message", messageHandler);
    };
  }, [ws]);
  function formatToLocalDateTime(dateString) {
    const date = new Date(dateString);  
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
  
    return `${hours}:${minutes}`;
  }
  
  return (
    <div className="p-4 gb-[#3F3D56]">
      <h2 className="text-lg  flex justify-center items-center gap-2 font-semibold mb-2">
        {" "}
        {connected ? "" : "connecting..."}{" "}
      </h2>
      <ul className="flex flex-col gap-2 transition-all ">
        {recentChatUsers.length > 0 &&
          recentChatUsers.map((user) => {
            return (
              <li
                key={user.chatId}
                className={`p-3 cursor-pointer rounded-lg  flex   ${
                  selectedUser?.id === user.id
                    ? "bg-[#008080d6] text-white"
                    : "bg-gray-200 "
                }`}
                onClick={() => onSelectUser(user)}
              >
                <div className="flex   w-[3rem]  justify-start items-center gap-3 ">
                  <img
                    src={
                      user.profileUrl
                        ? user.profileUrl
                        : "https://github.com/shadcn.png"
                    }
                    className="rounded-full h-9 w-9 object-cover"
                    alt=""
                  />
                </div>
                <div className="flex flex-col justify-center bg   w-full items-start  px-3">
                  <div className="flex justify-between    w-full   items-center gap-3 ">
                    <div className="font-medium max-w-[10rem]   overflow-hidden truncate">
                      {user?.name}
                    </div>
                    {onlineUsers &&
                    onlineUsers.map((u) => u.userId).includes(user.id) ? (
                      <div className="bg-green-500  rounded-4xl h-3 w-3"></div>
                    ) : (
                      <div className="bg-gray-500  rounded-4xl h-3 w-3"></div>
                    )}
                  </div>
                  <div
                    className={`text-sm   overflow-hidden truncate max-w-[10rem] ${
                      selectedUser?.id === user.id
                        ? "text-gray-2 00"
                        : "text-gray-500"
                    }`}
                  >
                    {user?.lastMessage} {formatToLocalDateTime(user.lastMessageCreatedAt)}
                  </div>
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default UserList;
