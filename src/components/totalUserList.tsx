import axios from "axios";
import { useEffect, useState } from "react";

interface UserListProps {
  users: any[]; // Adjust structure based on actual user data
  selectedUser: any; // ID of the selected user
  onSelectUser: (userId: string) => void; // Function to handle user selection
  connected: boolean; // Connection status (e.g., online/offline)
  heading: string;
  onlineUsers: object[];
}

const TotalUserList = ({
  selectedUser,
  onSelectUser,
  onlineUsers,
  logedInUser,
}: UserListProps) => {
  const [totalUsers, setTotalUSers] = useState([]);
  useEffect(() => {
    const getTotalUsers = async () => {
      const res = await axios.get("http://localhost:8000/user/all-users", {
        withCredentials: true,
      });
      if (res.status === 200) {
        console.log("user", logedInUser);
        console.log(res.data);
        const filterData = res?.data.filter((c) => c.id !== logedInUser.id);
        setTotalUSers(filterData);
      }
    };
    getTotalUsers();
  }, []);


  return (
    <div className="p-4  ">
      <ul className="flex flex-col gap-2">
        {totalUsers &&
          totalUsers?.map((user) => (
            <li
              key={user.id}
              className={`p-3  cursor-pointer rounded-lg   flex  justify-start items-center gap-3 ${
                selectedUser?.id === user.id ? "bg-blue-300" : "bg-gray-200"
              }`}
              onClick={() => onSelectUser(user)}
            >
                 <img src={user.profileUrl ? user.profileUrl : "https://github.com/shadcn.png" } className="rounded-full object-cover h-9 w-9" alt="" />
              <div className="font-medium  max-w-[10rem]  overflow-hidden truncate">{user?.name}</div>
              { onlineUsers && onlineUsers.map((u) => u.userId).includes(user.id) ? (
                <div className="bg-green-500 rounded-4xl h-3 w-3"></div>
              ) : (
                <div className="bg-gray-500 rounded-4xl h-3 w-3"></div>
              )}
              <div className="text-sm text-gray-500">{user?.lastMessage}</div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default TotalUserList;
