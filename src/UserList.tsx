import { useSelector } from "react-redux";
import { RootState } from "./store";

interface UserListProps {
  users: any[]; 
  selectedUser: any; 
  onSelectUser: (userId: string) => void; 
  totalUsers: number; 
  connected: boolean; 
  onlineUsers: Object[]  | undefined;
  heading:string
}

const UserList = ({
  users,
  selectedUser,
  onSelectUser,
  connected,
}: UserListProps) => {

  // const user = useSelector((state:RootState) =>state.user)
console.log(selectedUser)
  return (
    <div className="p-4 gb-[#3F3D56]">
      <h2 className="text-lg  flex justify-center items-center gap-2 font-semibold mb-2">
        {" "}
        {connected ? (
          ""
        ) : (
          "connecting..."
        )}{" "}
      </h2>
      <ul className="flex flex-col gap-2">
        {users &&
          users.map((user) => (
            <li
              key={user.id}
              className={`p-3 cursor-pointer rounded-lg  flex justify-start items-center gap-3 ${
                selectedUser?.id === user.id ? "bg-[#008080d6] text-white" : "bg-gray-200 "
              }`}
              onClick={() => onSelectUser(user)}
            >
              <img src={user.profileUrl ? user.profileUrl : "https://github.com/shadcn.png" } className="rounded-full h-8 w-8 object-cover" alt="" />
              <div className="font-medium">{user.name}</div>
              <div className="bg-green-500 rounded-4xl h-3 w-3"></div>
              <div className="text-sm text-gray-500">{user?.lastMessage}</div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default UserList;
