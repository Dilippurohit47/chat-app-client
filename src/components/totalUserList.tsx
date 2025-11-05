import { axios } from "../apiClient";;
import React, { useEffect, useState } from "react";
import { UserType } from "../slices/userSlice";
import { selectedChatType } from "../pages/Homepage";
import { IoSearch } from "react-icons/io5";
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
  const [filterUsers,setFilterusers] = useState<selectedChatType[]>(totalUsers)
  useEffect(() => {
    const getTotalUsers = async () => {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL_HTTP}/user/all-users`, {
        withCredentials: true,
      });
      if (res.status === 200) {
        const filterData = res?.data.filter((c:any) => c.id !== logedInUser.id);
        setTotalUSers(filterData);
        setFilterusers(filterData)
      }
    };
    getTotalUsers();
  }, []);


  const searchUsers = (query:string) =>{
setFilterusers(totalUsers.filter((user) => user.name.includes(query.toLowerCase())))
  }

  return (
    <div className="px-3 py-1  overflow-hidden">
      <div className="relative ">
      <input placeholder="search" className="border rounded-lg px-3 py-2 w-full mb-2 outline-none" onChange={(e) =>searchUsers(e.target.value)} />
      <div  className="absolute  top-2 right-2"><IoSearch className="text-gray-600" size={22} /></div>
      </div>
      
      <ul className="flex flex-col gap-2   hide-scrollbar overflow-y-auto max-h-[70vh]">
        {filterUsers &&
          filterUsers?.map((user) => (
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
