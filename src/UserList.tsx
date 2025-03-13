
interface UserListProps {
  users: any[]; // Adjust structure based on actual user data
  selectedUser: any; // ID of the selected user
  onSelectUser: (userId: string) => void; // Function to handle user selection
  totalUsers: number; // Total number of users
  connected: boolean; // Connection status (e.g., online/offline)
  onlineUsers: Object[]  | undefined;
  heading:string
}

const UserList = ({
  users,
  selectedUser,
  onSelectUser,
  connected,
}: UserListProps) => {
  return (
    <div className="p-4 gb-[#3F3D56]">
      <h2 className="text-lg  flex justify-center items-center gap-2 font-semibold mb-4">
        {" "}
        {connected ? (
          ""
        ) : (
          "connecting..."
        )}{" "}
      </h2>
      <ul>
        {users &&
          users.map((user) => (
            <li
              key={user.id}
              className={`p-3 hover:bg-gray-100 cursor-pointer rounded-lg  flex justify-center items-center gap-3 ${
                selectedUser?.id === user.id ? "bg-blue-100" : ""
              }`}
              onClick={() => onSelectUser(user)}
            >
              <div className="bg-green-500 rounded-4xl h-3 w-3"></div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-gray-500">{user?.lastMessage}</div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default UserList;
