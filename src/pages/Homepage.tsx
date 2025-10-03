import { useEffect, useRef, useState } from "react";
import "../App.css";
import UserList from "../components/UserList";
import ChatWindow, { MessageType } from "../components/ChatWindow";
import { axios } from "../apiClient";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import TotalUserList from "../components/totalUserList";
import { useDispatch, useSelector } from "react-redux";
import {
  saveUser,
  saveAccessToken,
  logout,
  UserType,
} from "../slices/userSlice";
import { RootState } from "../store";
import GroupList from "../components/GroupList";

import GroupChatWindow from "../components/GroupChatWindow";
import { useWebSocket, WebSocketContextType } from "../context/webSocket";
// import AnswerVideoCall from "../components/AnswerVideoCall";
import CallNotificationDialog from "../components/CallNotificationDialog";
import AnswerVideoCall from "../components/AnswerVideoCall";

type members = {
  groupId: string;
  id: string;
  user: UserType;
  userId: string;
};

export interface SelectedGroupType {
  id: string;
  name: string;
  groupProfilePicture?: string;
  members: members[];
  lastMessage?: string;
  description?: string;
}

export type unreadCountType = {
  unreadMessages: number;
  userId: string;
};
export interface selectedChatType {
  name: string;
  chatId: string;
  createdAt: Date;
  email: string;
  id: string;
  lastMessage: string;
  lastMessageCreatedAt: string;
  // password:string,
  profileUrl: string;
  refreshToken: String;
  tokenExpiresIn: Date | null;
  unreadCount: unreadCountType;
}

type incomingCallType = {
  callerId: string;
  callStatus: string;
  callerName: string;
  callerProfileUrl: string;
};

function Home() {
  const dispatch = useDispatch();

  const [selectedUser, setSelectedUser] = useState<selectedChatType | null>(
    null
  );
  const [selectedGroup, setSelectedGroup] = useState<SelectedGroupType | null>(
    null
  );
  const [callAccepted, setCallAccepted] = useState<boolean>(false);
  const [showCallNotification, setShowCallNotification] =
    useState<boolean>(false);
  const user = useSelector((state: RootState) => state.user);
  const [incomingCall, setIncomingCall] = useState<incomingCallType | null>(
    null
  );
  const answerVideoCallRef  = useRef<any>(null)
   const [selectedTab, setSelectedTab] = useState("");
  const [chatId, setChatId] = useState<string | null>("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const { ws, connected, setConnected, onlineUsers }: WebSocketContextType =
    useWebSocket();
  useEffect(() => {
    if (!ws.current) return;

    ws.current.onerror = (e) => {
      console.error("WebSocket error:", e);
      setConnected(false);
    };

    const handleMessage = (m: MessageEvent) => {
      const data = JSON.parse(m.data);
      if (data.type === "someone-is-calling") {
        const callerData = data.callerData;

        setIncomingCall({
          callerId: callerData.callerId,
          callerName: callerData.callerName,
          callerProfileUrl: callerData.callerProfileUrl,
          callStatus: "incoming",
        });
        setShowCallNotification(true);
      }
      if (data.type === "client-call-status") {
        if(data.callStatus === "hang-up"){
          if(answerVideoCallRef.current){
            answerVideoCallRef.current.hangUp()
            answerVideoCallRef.current = null
          }
        setIncomingCall(null);

        } 
      }
    };
    ws.current.addEventListener("message", handleMessage);

    return () => {
      if (!ws.current) return;
      ws.current.removeEventListener("message", handleMessage);
    };
  }, [connected]);

  useEffect(() => {
    const getAccessToken = async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL_HTTP}/user/refresh`,
        {
          withCredentials: true,
        }
      );

      if (res.status === 200) {
        console.log("get access token", res.data);
        dispatch(saveAccessToken({ accessToken: res.data.accessToken }));
      }
      if (res.status == 403) {
        getAccessToken();
      }
      if (res.status !== 403 && res.status !== 200) {
        dispatch(logout());
      }
    };
    if (!user.accessToken) {
      getAccessToken();
    }
  }, []);
  useEffect(() => {
    const getUser = async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL_HTTP}/user/get-user`,
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
          withCredentials: true,
        }
      );
      if (res.status === 200) {
        console.log("user data", res);
        dispatch(saveUser(res.data.user));
      }
    };
    getUser();
  }, [user.accessToken]);
 

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

  const callRejected =() =>{
    if(!incomingCall?.callerId) return
    ws.current?.send(JSON.stringify({
      type:"call-status",
      callStatus:"hang-up",
      callReceiverId:incomingCall?.callerId
    }))
  }
  return (
    <div className="flex h-[84.5vh] md:h-[calc(100vh-3rem)]  relative justify-center mx-auto my-auto sm:mx-0 hide-scrollbar ">
      <div
        className={` shadow-2xl rounded-md border-r border-gray-300 border-2  sm:mr-0  ${
          isMobile && !(selectedUser === null)
            ? " hidden -translate-x-[100%] w-0"
            : "w-1/4  sm:w-full"
        } `}
      >
        <Tabs defaultValue="online-users" className={`w-[300px] sm:w-full`}>
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
      <div className="w-3/4 md:w-[100vw] relative ">
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
        {callAccepted && (
          <AnswerVideoCall
            setCallAccepted={setCallAccepted}
            isCallAccepted={callAccepted}
            callerId={incomingCall?.callerId}
            ref={answerVideoCallRef}
          />
        )}
      </div>
      {incomingCall && showCallNotification && (
        <CallNotificationDialog
          callerData={incomingCall}
          onAccept={() => {
            setCallAccepted(true);
            setShowCallNotification(false);
          }}
          onReject={() => callRejected()}
          onIgnore={() => setShowCallNotification(false)}
        />
      )}
    </div>
  );
}

export default Home;
