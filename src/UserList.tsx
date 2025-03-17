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
}

const UserList = ({
  users,
  logedInUser,
  selectedUser,
  onSelectUser,
  connected,
}: UserListProps) => {
  const [recentChatUsers, setRecentChatUsers] = useState([]);

  useEffect(() => {
    const getTotalUsers = async () => {
      const res = await axios.get(
        "http://localhost:8000/chat/get-recent-chats",
        { params: { userId: logedInUser.id }, withCredentials: true }
      );
      if (res.status === 200) {
        console.log(res.data);
        const filterData = res?.data.chats.filter(
          (c) => c.id !== logedInUser.id
        );
        setRecentChatUsers(filterData);
      }
    };
    getTotalUsers();
  }, [logedInUser]);
  return (
    <div className="p-4 gb-[#3F3D56]">
      <h2 className="text-lg  flex justify-center items-center gap-2 font-semibold mb-2">
        {" "}
        {connected ? "" : "connecting..."}{" "}
      </h2>
      <ul className="flex flex-col gap-2">
        {recentChatUsers &&
          recentChatUsers.map((chat) => {
            const user = chat.otherUser;
            return (
              <li
                key={chat.id}
                className={`p-3 cursor-pointer rounded-lg  flex   ${
                  selectedUser?.id === user.id
                    ? "bg-[#008080d6] text-white"
                    : "bg-gray-200 "
                }`}
                onClick={() => onSelectUser(user)}
              >
                <div className="flex   justify-start items-center gap-3 ">
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
                <div className="flex flex-col justify-center items-start  px-5">
                  <div className="flex justify-start   w-full items-center gap-3 ">
                    <div className="font-medium max-w-[10rem]  overflow-hidden truncate">
                      {user?.name}
                    </div>
                    <div className="bg-green-500  rounded-4xl h-3 w-3"></div>
                  </div>
                  <div className={`text-sm   overflow-hidden truncate max-w-[10rem] ${selectedUser?.id === user.id ? "text-gray-2 00":"text-gray-500"}`}>
                    {chat?.lastMessage}
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
