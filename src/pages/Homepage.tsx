import { useEffect, useRef, useState } from "react";
import "../App.css";
import UserList from "../components/UserList";
import ChatWindow from "../components/ChatWindow";
import axios from "axios";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import TotalUserList, { onlineUsersType } from "../components/totalUserList";
import { useDispatch, useSelector } from "react-redux";
import { saveUser, UserType } from "../slices/userSlice";
import { RootState } from "../store";
import GroupList from "../components/GroupList";
import GroupChatWindow from "../components/GroupChatWindow";

function Home() {
  const ws = useRef<WebSocket | null>(null);
  const dispatch = useDispatch();

  const [connected, setConnected] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<onlineUsersType[]>([]);
  const [selectedGroup,setSelectedGroup] = useState()
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!user.isLogin) return;
    ws.current = new WebSocket(`${import.meta.env.VITE_BASE_URL_WS}`);
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
      if (data.type === "online-users") {
        const filterData = data?.onlineUsers.filter(
          (c: onlineUsersType) => c.id !== user.id
        );
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
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL_HTTP}/user/get-user`,
        {
          withCredentials: true,
        }
      );
      if (res.status === 200) {
        dispatch(saveUser(res.data));
      }
    };
    getUser();
  }, []);
  const [selectedTab,setSelectedTab] = useState("")
  return (
    <div className="flex h-[84.5vh]  hide-scrollbar">
      <div className="w-1/4 shadow-2xl rounded-md border-r border-gray-300 border-2 mr-2">
        <Tabs defaultValue="online-users" className="w-[300px]">
          <TabsList className="w-full border-2 ">
            <TabsTrigger
              value="online-users"
              className="cursor-pointer data-[state=active]:bg-[#008080] data-[state=active]:text-white"
              onClick={()=>{setSelectedTab("recent-chats"),setSelectedGroup(null)}}
            >
              Recent
            </TabsTrigger>
            <TabsTrigger
              value="groups"
              className="cursor-pointer data-[state=active]:bg-[#008080] data-[state=active]:text-white"
              onClick={()=>{setSelectedTab("group-list") ,setSelectedUser(null)}}
            >
              Groups
            </TabsTrigger>
            <TabsTrigger
              value="total-users"
              className="cursor-pointer data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              onClick={()=>setSelectedTab("all-users")}
            >
              Total
            </TabsTrigger>
     
          </TabsList>
          <TabsContent value="online-users">
            <UserList
              selectedUser={selectedUser}
              onSelectUser={setSelectedUser}
              connected={connected}
              logedInUser={user}
              ws={ws.current}
              onlineUsers={onlineUsers}
            />
          </TabsContent>
          <TabsContent value="total-users">
            <TotalUserList
              selectedUser={selectedUser}
              onSelectUser={setSelectedUser}
              onlineUsers={onlineUsers}
              logedInUser={user}
            />
          </TabsContent>
          <TabsContent value="groups">
            <GroupList
              selectedGroup={selectedGroup}
              setSelectedGroup={setSelectedGroup}
              // onlineUsers={onlineUsers}
              connected={connected}
              logedInUser={user}
            />
          </TabsContent>
        </Tabs>
      </div>
      {/* Chat Window Section */}
      <div className="w-3/4 bg-gray-50">
        { selectedUser &&  (
          <ChatWindow
            logedInUser={user}
            ws={ws.current}
            senderId={user.id!}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
          /> )}
    {
      !selectedUser && !selectedGroup &&    <div className="flex bg-[#1e1e2e] items-center justify-center h-full text-gray-200 rounded-md text-[1.1rem] ">
            {user.isLogin 
              ? selectedTab !== "group-list" ? "select a user and start chating" :"select group and start sending messages"
              : "Log in first to start chatting"}
          </div>
    }

        {
          selectedTab === "group-list" && selectedGroup && <GroupChatWindow  logedInUser={user}
            ws={ws.current}
            senderId={user.id!}
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup} />
        }
      </div>
    </div>
  );
}

export default Home;
