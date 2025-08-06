import { useEffect, useState } from "react";
import axios from "axios";
import { UserType } from "../slices/userSlice";
import { onlineUsersType } from "../components/totalUserList";
import ContextMenuDialogBox from "./contextMenuDialogBox";

export interface UserListProps {
  selectedUser: any;
  onSelectUser: (state: null) => void;
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
  setChatId,
  setMessages,
}: UserListProps) => {
  const [recentChatUsers, setRecentChatUsers] = useState<ChatUser[]>([]);
  useEffect(() => {
    const getTotalUsers = async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL_HTTP}/chat/get-recent-chats`,
        { params: { userId: logedInUser.id }, withCredentials: true }
      );
      if (res.status === 200) {
        console.log(res.data.chats)
        setRecentChatUsers(res.data.chats);
      }
    };
    getTotalUsers();
    if (!logedInUser.isLogin) {
      setRecentChatUsers([]);
      onSelectUser(null);
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
    ws.send(
      JSON.stringify({
        type: "get-recent-chats",
        userId: logedInUser.id,
      })
    );
    ws.addEventListener("message", messageHandler);
    return () => {
      ws.removeEventListener("message", messageHandler);
    };
  }, [ws, selectedUser]);

  function formatToLocalDateTime(dateString: string) {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
  }
  const [openContextMenu, setOpenContextMenu] = useState<null | string >("");

  const handleContextMenu = (e: Event, user: UserListProps) => {
    e.preventDefault();
    setOpenContextMenu((prev) => (prev === user.id ? "" : user.id));
  
  };

  const deletechat = (deletedChatId:string) =>{
    setRecentChatUsers((prev) =>prev.filter(({chatId}) => chatId !== deletedChatId ))
  }
  return (
    <div className="px-3 py-1 w-full md:px-1 ">
      <h2 className="text-[1.2rem]  flex justify-center items-center gap-2 font-semibold mb-2">
        {" "}
        {logedInUser.isLogin
          ? connected
            ? ""
            : "connecting..."
          : "Login first "}{" "}
      </h2>
      <ul className="flex flex-col gap-2 transition-all  ">
        {recentChatUsers?.length > 0
          ? recentChatUsers.map((user) => {
              return (
               <div className="relative">
                  <li
                    onContextMenu={(e) => handleContextMenu(e, user)}
                    key={user.chatId}
                    className={`p-3 md:p-1 cursor-pointer lg:w-[20vw]  rounded-lg  b flex  ${
                      selectedUser?.id === user.id
                        ? "bg-[#008080d6] text-white" 
                        : "bg-gray-200 "
                    }`}
                    onClick={() => {onSelectUser(user) ;setOpenContextMenu(null) ;setChatId(user.chatId)}}
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
                        <div className="font-medium max-w-[10rem] text-primary2   overflow-hidden truncate">
                          {user?.name}
                        </div>
                        {onlineUsers &&
                        onlineUsers.map((u) => u.userId).includes(user.id) ? (
                          <div className="bg-green-500  rounded-4xl h-2 w-2"></div>
                        ) : (
                          <div className="bg-gray-500  rounded-4xl h-2 w-2"></div>
                        )}
                      </div>
                      <div
                        className={`text-sm flex    justify-between w-full overflow-hidden truncate  ${
                          selectedUser?.id === user.id
                            ? "text-gray-200"
                            : "text-gray-500"
                        }`}
                      >
                        <span className="max-w-[8rem] overflow-hidden truncate">
                          {" "}
                          {user?.lastMessage}
                        </span>
                        <div className="flex gap-1 justify-center items-center ">
                          {user.chatId !== selectedUser?.chatId &&
                          user?.unreadCount?.userId === logedInUser.id
                            ? user.unreadCount !== null &&
                              user.unreadCount?.unreadMessages !== 0 && (
                                <div className="text-white bg-blue-400 rounded-full h-4 w-4 flex items-center justify-center text-[0.6rem] p-2 text-center">
                                  {user.unreadCount?.unreadMessages}
                                </div>
                              )
                            : ""}
                          <span>
                            {" "}
                            {formatToLocalDateTime(user.lastMessageCreatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                  {openContextMenu === user.id && (
                    <ContextMenuDialogBox
                      open={openContextMenu}
                      setOpen={setOpenContextMenu}
                      userId={user.id}
                      deletechat={deletechat}
                      chatId={user.chatId}
                      setMessages={setMessages}
                      onSelectUser={onSelectUser}
                    />
                  )}
               </div>
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
