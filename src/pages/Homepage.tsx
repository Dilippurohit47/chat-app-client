import { useEffect, useRef, useState } from "react";
import "../App.css";
import UserList from "../UserList";
import ChatWindow from "../ChatWindow";
import axios from "axios";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import TotalUserList from "../components/totalUserList";

function Home() {
  const ws = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState();
  const [idInput, setIdInput] = useState();
  const [message, setMessage] = useState([]);
  const [user, setUser] = useState();

  useEffect(() => {
    if (!user) return;
    ws.current = new WebSocket("ws://localhost:8000");
    ws.current.onopen = () => {
      console.log("WebSocket connection opened");
      ws.current!.send(
        JSON.stringify({
          type: "user-info",
          userId: user.id,
        })
      );
      setConnected(true);
    };

    ws.current.onerror = (e) => {
      console.error("WebSocket error:", e);
      setConnected(false);
    };
    ws.current.onmessage = (m) => {
      const data = JSON.parse(m.data);

      if (data.type === "personal-msg") {
        setMessage((prev) => [...prev, data.message]);
      }

   
      if (data.type === "online-users") {
        console.log(data.onlineUsers)
        const filterData = data?.onlineUsers.filter((c) => c.id !== user.id);
        setOnlineUsers(filterData);
      }
    };
    ws.current.onclose = () => {
      console.log("WebSocket connection closed");
      setConnected(false);
    };

    return () => {
      if (ws.current) {
        ws.current.close(1000);
      }
    };
  }, [user]);

  useEffect(() => {
    const getUser = async () => {
      const res = await axios.get("http://localhost:8000/user/get-user", {
        withCredentials: true,
      });
      if (res.status === 200) {
        setUser(res.data);
        localStorage.setItem("userId", res.data.id);
      }
    };
    getUser();
  }, []);


  return (
    <div className="flex h-screen bg-gray-100">
{user && user.name}
      <div className="w-1/4 bg-white border-r border-gray-200">
        <Tabs defaultValue="online-users" className="w-[300px]">
          <TabsList className="w-full border-2 shadow-md">
            <TabsTrigger value="online-users"       className="cursor-pointer data-[state=active]:bg-blue-500 data-[state=active]:text-white">Online</TabsTrigger>
            <TabsTrigger value="total-users"  className="cursor-pointer data-[state=active]:bg-blue-500 data-[state=active]:text-white">Total</TabsTrigger>
          </TabsList>
          <TabsContent value="online-users">
            <UserList 
            users={onlineUsers}
            selectedUser={selectedUser}
            onSelectUser={setSelectedUser}
            connected={connected}
            user={user}
            onlineUsers={onlineUsers}
            />
          </TabsContent>
          <TabsContent value="total-users">
          <TotalUserList
            selectedUser={selectedUser}
            onSelectUser={setSelectedUser}
            onlineUsers={onlineUsers}

            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat Window Section */}
      <div className="w-3/4 bg-gray-50">
        {selectedUser ? (
          <ChatWindow
            messages={message}
            user={selectedUser}
            ws={ws.current}
            senderId={user.id}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
