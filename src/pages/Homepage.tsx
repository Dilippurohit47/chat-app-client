import { useEffect, useState } from "react";
import "../App.css";
import ChatWindow from "../features/chat/components/ChatWindow";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import TotalUserList from "../features/chat/components/totalUserList";
import {  useSelector } from "react-redux";
import { RootState } from "../store";
import GroupList from "../features/group/components/GroupList";

import GroupChatWindow from "../features/group/components/GroupChatWindow";
import { useWebSocket } from "../context/webSocket";
import { WebSocketContextType } from "../types/index";
import CallNotificationDialog from "../features/call/components/CallNotificationDialog";
import AnswerVideoCall from "../features/call/components/AnswerVideoCall";
import {
  selectedChatType,
  SelectedGroupType,
} from "../types";
import { useSyncOfflineMessage } from "../features/chat/hooks/useSyncOfflineMessage";
import UserList from "../features/chat/components/UserList";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useCallManager } from "../features/call/hooks/useCallManager";
import { useIsMobile } from "../hooks/useIsMobile";

function Home() {

  const [selectedUser, setSelectedUser] = useState<selectedChatType | null>(
    null,
  );
  const [selectedGroup, setSelectedGroup] = useState<SelectedGroupType | null>(
    null,
  );

  const user = useSelector((state: RootState) => state.user);
  const [selectedTab, setSelectedTab] = useState<"online-users" | "groups" | "total-users" >("online-users");
  const [chatId, setChatId] = useState<string | null>("");

  const  {isMobile} =useIsMobile()
  const { ws, connected, onlineUsers }: WebSocketContextType = useWebSocket();
  const {
    showCallNotification,
    callRejected,
    callIsAccepted,
    callAccepted,
    incomingCall,
    callIsIgnored,
    callIsEnded,
  } = useCallManager({ ws, connected });

  const isOnline = useNetworkStatus();
  const { syncOfflineSaveMessages } = useSyncOfflineMessage({
    ws: ws.current,
    senderId: user.id,
  });
  useEffect(() => {
    if (!isOnline) return;
    syncOfflineSaveMessages();
  }, [isOnline]);



  return (
    <div className="flex  h-[84.5vh] sm:h-[calc(100vh-3rem)] md:h-[calc(100vh-3rem)]  relative justify-center mx-auto my-auto sm:mx-0 hide-scrollbar ">
      <div
        className={` shadow-2xl sm:w-[100%] rounded-md border-r  border-gray-300 border-2  sm:mr-0   ${
          isMobile && !((selectedUser || selectedGroup) === null)
            ? " hidden -translate-x-[100%]   "
            : "w-1/4  md:w-[35%]"
        } `}
      >
        <Tabs
          defaultValue="online-users"
          className={` md:max-w-[400px] md:mx-auto md:my-0 sm:w-full`}
          value={selectedTab} onValueChange={setSelectedTab}
        >
          <TabsList className="w-full border-2 ">
            <TabsTrigger
              value="online-users"
              className="cursor-pointer data-[state=active]:bg-[#008080] data-[state=active]:text-white"
              onClick={() => {
                ( setSelectedGroup(null));
              }}
            >
              Recent
            </TabsTrigger>
            <TabsTrigger
              value="groups"
              className="cursor-pointer data-[state=active]:bg-[#008080] data-[state=active]:text-white"
              onClick={() => {
                ( setSelectedUser(null));
              }}
            >
              Groups
            </TabsTrigger>
            <TabsTrigger
              value="total-users"
              className="cursor-pointer data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              onClick={() => {
                (setSelectedUser(null));
              }}
            >
              Total
            </TabsTrigger>
          </TabsList>
          <TabsContent value="online-users" forceMount>
            <UserList
              isConnected={connected}
              selectedUser={selectedUser}
              onSelectUser={setSelectedUser}
              connected={connected}
              logedInUser={user}
              ws={ws.current}
              onlineUsers={onlineUsers}
              setChatId={setChatId}
            />
          </TabsContent>
          <TabsContent value="total-users" forceMount>
            <TotalUserList
              selectedUser={selectedUser}
              onSelectUser={setSelectedUser}
              onlineUsers={onlineUsers}
              logedInUser={user}
            />
          </TabsContent>
          <TabsContent value="groups" forceMount>
            <GroupList
              selectedGroup={selectedGroup}
              setSelectedGroup={setSelectedGroup}
              connected={connected}
              logedInUser={user}
            />
          </TabsContent>
        </Tabs>
      </div>
      {/* Chat Window Section */}
      <div
        className={` relative w-3/4  ${
          selectedUser || selectedGroup
            ? "md:w-full sm:w-[100%] sm:h-[100%]"
            : "sm:w-0"
        }`}
      >
        {selectedUser && (
          <ChatWindow
            logedInUser={user}
            ws={ws.current}
            senderId={user.id!}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            chatId={chatId}
            selectedTab={selectedTab}
          />
        )}
        {!selectedUser && !selectedGroup && (
          <div className="flex bg-[#1e1e2e] sm:hidden   items-center justify-center h-full text-gray-200 rounded-md text-[1.1rem] md:rounded-none  ">
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
            callIsEnded={callIsEnded}
            isCallAccepted={callAccepted}
            callerId={incomingCall?.callerId}
          />
        )}
      </div>
      {incomingCall && showCallNotification && (
        <CallNotificationDialog
          callerData={incomingCall}
          onAccept={() => callIsAccepted()}
          onReject={callRejected}
          onIgnore={() => callIsIgnored()}
        />
      )}
    </div>
  );
}

export default Home;
