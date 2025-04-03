import { useEffect, useState } from "react";
import axios from "axios";
import { UserType } from "./slices/userSlice";
import { onlineUsersType } from "./components/totalUserList";

interface UserListProps {
  selectedUser: any;
  onSelectUser: (state:  | null) => void;
  connected: boolean;
  onlineUsers: onlineUsersType[] | undefined;
  ws: WebSocket | null;
  logedInUser: UserType;
}
type ChatUser = {
  chatId: string;
  createdAt: string; // If using Date objects, change to `Date`
  email: string;
  id: string;
  lastMessage: string;
  lastMessageCreatedAt: string; // Change to `Date` if needed
  name: string;
  password: string; // Consider removing this for security
  profileUrl: string;
};
const UserList = ({
  logedInUser,
  selectedUser,
  onSelectUser,
  connected,
  ws,
  onlineUsers,
}: UserListProps) => {
  const [recentChatUsers, setRecentChatUsers] = useState<ChatUser[]>([]);
  useEffect(() => { 
    const getTotalUsers = async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL_HTTP}/chat/get-recent-chats`,
        { params: { userId: logedInUser.id }, withCredentials: true }
      );
      if (res.status === 200) {
        setRecentChatUsers(res.data.chats);
      }
    };
    getTotalUsers();
    if (!logedInUser.isLogin) {
      setRecentChatUsers([]);
      onSelectUser(null)
    }
  }, [logedInUser]);

  useEffect(() => {
    if (!ws) return;
    const messageHandler = (m: any) => {
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
  function formatToLocalDateTime(dateString: string) {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
  }
  return (
    <div className="p-4 gb-[#3F3D56]">
      <h2 className="text-[1.2rem]  flex justify-center items-center gap-2 font-semibold mb-2">
        {" "}
        {logedInUser.isLogin
          ? connected
            ? ""
            : "connecting..."
          : "Login first "}{" "}
      </h2>
      <ul className="flex flex-col gap-2 transition-all ">
        {recentChatUsers?.length > 0
          ? recentChatUsers.map((user) => {
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
                      className={`text-sm flex  justify-between w-full overflow-hidden truncate max-w-[10rem] ${
                        selectedUser?.id === user.id
                          ? "text-gray-2 00"
                          : "text-gray-500"
                      }`}
                    >
                      <span> {user?.lastMessage}</span>
                      <span>
                        {" "}
                        {formatToLocalDateTime(user.lastMessageCreatedAt)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })
          : connected
          ? "oops no chats available"
          : ""}
      </ul>
    </div>
  );
};

export default UserList;
