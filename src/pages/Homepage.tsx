import { useEffect, useRef, useState } from "react";
import "../App.css";
import UserList from "../components/UserList";
import ChatWindow, { MessageType } from "../components/ChatWindow";
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
import { useWebSocket } from "../context/webSocket";

function Home() {
  const dispatch = useDispatch();

  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedGroup, setSelectedGroup] = useState();
  const user = useSelector((state: RootState) => state.user); 

const {ws ,connected ,setConnected ,connectionBooleanRef ,onlineUsers} = useWebSocket()
  useEffect(() => {
    if(!ws.current) return
    console.log("rund")
     
      ws.current.onerror = (e) => {
        console.error("WebSocket error:", e);
        setConnected(false);
      };
     const  messageHandler = (m) => {
       
      };

    ws.current.addEventListener("message", messageHandler);
      

  }, [connected]);
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
  const [selectedTab, setSelectedTab] = useState("");
  const [chatId, setChatId] = useState<string | null>("");
  const [messages, setMessages] = useState<MessageType[] | []>([]);
  const [isMobile,setIsMobile] = useState<boolean>(false)

useEffect(() => {
  const handleScreenSize = () => {
    setIsMobile(window.innerWidth < 521);
  };

  // Run once on mount to set initial state
  handleScreenSize();

  window.addEventListener("resize", handleScreenSize);
  return () => {
    window.removeEventListener("resize", handleScreenSize);
  };
}, []);

console.log(selectedUser, isMobile);

  return (
    <div className="flex h-[84.5vh] md:h-[calc(100vh-3rem)]  justify-center mx-auto my-auto sm:mx-0 hide-scrollbar ">
      <div className={` shadow-2xl rounded-md border-r border-gray-300 border-2  sm:mr-0  ${isMobile && !(selectedUser === null) ? " hidden -translate-x-[100%] w-0" :"w-1/4  sm:w-full"} `}>
        <Tabs  defaultValue="online-users" className={`w-[300px] sm:w-full`}>
          <TabsList className="w-full border-2 ">
            <TabsTrigger
              value="online-users"
              className="cursor-pointer data-[state=active]:bg-[#008080] data-[state=active]:text-white"
              onClick={() => {
                setSelectedTab("recent-chats"), setSelectedGroup(null);
              }}
            >
              Recent
            </TabsTrigger>
            <TabsTrigger
              value="groups"
              className="cursor-pointer data-[state=active]:bg-[#008080] data-[state=active]:text-white"
              onClick={() => {
                setSelectedTab("group-list"), setSelectedUser(null);
              }}
            >
              Groups
            </TabsTrigger>
            <TabsTrigger
              value="total-users"
              className="cursor-pointer data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              onClick={() => setSelectedTab("all-users")}
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
              setChatId={setChatId}
              setMessages={setMessages}
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
      <div className="w-3/4 md:w-[100vw] ">
        {selectedUser && (
          <ChatWindow
            logedInUser={user}
            ws={ws.current}
            senderId={user.id!}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            chatId={chatId}
            messages={messages}
            setMessages={setMessages}
          />
        )}
        {!selectedUser && !selectedGroup && (
          <div className="flex bg-[#1e1e2e] sm:hidden  items-center justify-center h-full text-gray-200 rounded-md text-[1.1rem] md:rounded-none  ">
            {user.isLogin
              ? selectedTab !== "group-list"
                ? "select a user and start chating"
                : "select group and start sending messages"
              : "Log in first to start chatting"}
          </div>
        )}

        {selectedTab === "group-list" && selectedGroup && (
          <GroupChatWindow
            logedInUser={user}
            ws={ws.current}
            senderId={user.id!}
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
          />
        )}
      </div>
     
    </div>
  );
}

export default Home;
