import { axios } from "../apiClient";;
import React, { useEffect, useState } from "react";
import { UserType } from "../slices/userSlice";
import { selectedChatType } from "../pages/Homepage";

export type onlineUsersType = string

interface UserListProps {
  selectedUser: selectedChatType | null; 
  onSelectUser: React.Dispatch<React.SetStateAction<selectedChatType | null>>; 
  onlineUsers: onlineUsersType[];
  logedInUser:UserType
}


const TotalUserList = ({
  selectedUser,
  onSelectUser,
  onlineUsers,
  logedInUser,
}: UserListProps) => {
  const [totalUsers, setTotalUSers] = useState<selectedChatType[]>([]);
  useEffect(() => {
    const getTotalUsers = async () => {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL_HTTP}/user/all-users`, {
        withCredentials: true,
      });
      if (res.status === 200) {
        console.log("user", logedInUser);
        console.log(res.data);
        const filterData = res?.data.filter((c:any) => c.id !== logedInUser.id);
        setTotalUSers(filterData);
      }
    };
    getTotalUsers();
  }, []);

  return (
    <div className="px-3 py-1">
      <ul className="flex flex-col gap-2">
        {totalUsers &&
          totalUsers?.map((user) => (
            <li
              key={user.id}
              className={`p-3    cursor-pointer rounded-lg   flex  justify-evenly items-center gap-3 ${
                selectedUser?.id === user.id ? "bg-blue-300" : "bg-gray-200"
              }`}
              onClick={() => onSelectUser(user)}
            >
                 <img src={user.profileUrl ? user.profileUrl : "https://github.com/shadcn.png" } className="rounded-full object-cover h-9 w-9" alt="" />
              <div className="font-medium  max-w-[10rem]  overflow-hidden truncate">{user?.name}</div>
              { onlineUsers && onlineUsers.map((u:string) => u).includes(user.id!) ? (
                <div className="bg-green-500 rounded-3xl h-2 w-2"></div>
              ) : (
                <div className="bg-gray-500 rounded-3xl h-2 w-2"></div>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default TotalUserList;
