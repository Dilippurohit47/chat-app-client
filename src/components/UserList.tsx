import React, { useEffect, useRef, useState } from "react";
import { axios } from "../apiClient";
import ContextMenuDialogBox from "./contextMenuDialogBox";
import AiChatBot from "./aiChatBot";
import {
  decryptMessage,
  getkeyFromIndexedDb,
  importPrivateKey,
} from "../lib/helper";
import { IoSearch } from "react-icons/io5";
import { selectedChatType, UserListProps } from "../types";
import { useSelector } from "react-redux";
import { RootState } from "../store";

const UserList = ({
  logedInUser,
  selectedUser,
  onSelectUser,
  connected,
  ws,
  isConnected,
  onlineUsers,
  setChatId,
  setMessages,
}: UserListProps) => {
  const [recentChatUsers, setRecentChatUsers] = useState<selectedChatType[]>(
    []
  );

  const [userIsTyping, setUserIsTyping] = useState<string[]>([]);
  const [filterChats,setSetFilterChats] =useState<selectedChatType[]>([])
  const timersRef = useRef<Map<string, number>>(new Map());


   const onUserIsTyping = (userId: string, inactivityMs = 3000) => {
    // add user to the list if not present
    setUserIsTyping(prev => {
      if (prev.includes(userId)) return prev;
      return [...prev, userId];
    });

    // clear existing timeout for this user
    const existing = timersRef.current.get(userId);
    if (existing) clearTimeout(existing);

    // set new timeout to remove only this user after inactivityMs
    const t = window.setTimeout(() => {
      timersRef.current.delete(userId);
      setUserIsTyping(prev => prev.filter(id => id !== userId));
    }, inactivityMs);

    timersRef.current.set(userId, t);
  };

  // call this when you receive "user-stopped-typing"
  const onUserStoppedTyping = (userId: string) => {
    // clear timer and remove user immediately
    const existing = timersRef.current.get(userId);
    if (existing) {
      clearTimeout(existing);
      timersRef.current.delete(userId);
    }
    setUserIsTyping(prev => prev.filter(id => id !== userId));
  };

const user = useSelector((state:RootState)=>state.user)

  useEffect(() => {
    const getTotalUsers = async () => {

      // const headers ={
      //   Authorization:`Bearer ${user.accessToken}`
      // }
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL_HTTP}/chat/get-recent-chats`
      );
      if (res.status === 200) {
        let chats = res.data.chats as selectedChatType[];
        console.log("chats length",chats.length)
        if (typeof chats === "string") {
  chats = JSON.parse(chats);
    }
        if (chats?.length > 0) {
          const privateKeyString = await getkeyFromIndexedDb();
          const privateKeyCrypto = await importPrivateKey(privateKeyString!);

          const decryptedChats = (
            await Promise.all(
              chats.map(async (user) => {
                if (user.senderId === logedInUser.id) {
                  const decryptedMessage = await decryptMessage(
                    user.lastMessageForSender,
                    privateKeyCrypto
                  );


                  user.lastMessage = decryptedMessage;
                  return user;
                } else {
                  if (privateKeyCrypto) {
                    const decryptedMessage = await decryptMessage(
                      user.lastMessageForReceiver,
                      privateKeyCrypto
                    );

                  console.log("DECryoted",decryptedMessage)
                    user.lastMessage = decryptedMessage;
                    return user;
                  }
                }

                //  return user
              })
            )
          ).filter((chat) => chat !== undefined);
          setRecentChatUsers(decryptedChats);
          setSetFilterChats(decryptedChats)
        }
      }
    };
    getTotalUsers();
    if (!logedInUser.isLogin) {
      setRecentChatUsers([]);
          setSetFilterChats([])
      onSelectUser(null);
    }
  }, [logedInUser]);

  useEffect(() => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const messageHandler = async (m: any) => {
      const data = JSON.parse(m.data);
      if (data.type === "recent-chats") {
        const chats = data.chats as selectedChatType[];
        const privateKeyString = await getkeyFromIndexedDb();
        const privateKeyCrypto = await importPrivateKey(privateKeyString!);

        const decryptedChats = (
          await Promise.all(
            chats.map(async (user) => {
              if (user.senderId === logedInUser.id) {
                if (privateKeyCrypto) {
                  const decryptedMessage = await decryptMessage(
                    user.lastMessageForSender,
                    privateKeyCrypto
                  );
                  user.lastMessage = decryptedMessage;
                  return user;
                }
              } else {
                if (privateKeyCrypto) {
                  const decryptedMessage = await decryptMessage(
                    user.lastMessageForReceiver,
                    privateKeyCrypto
                  );
                  user.lastMessage = decryptedMessage;
                  return user;
                }
              }
            })
          )
        ).filter((u) => u !== undefined);
        setRecentChatUsers(decryptedChats);
          setSetFilterChats(decryptedChats)

      }
      if (data.type === "user-is-typing") {
        onUserIsTyping(data.senderId)
      }
      if (data.type === "user-stopped-typing") {
      onUserStoppedTyping(data.senderId)
      }
    };
    ws.send(
      JSON.stringify({
        type: "get-recent-chats",
        userId: logedInUser.id,
      })
    );
    ws.addEventListener("message", messageHandler);
    return () => {
      ws.removeEventListener("message", messageHandler);
    };
  }, [isConnected,selectedUser]);

    useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, []);


  function formatToLocalDateTime(dateString: string) {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
  }
  const [openContextMenu, setOpenContextMenu] = useState<null | string>("");

  const handleContextMenu = (
    e: React.MouseEvent<HTMLLIElement, MouseEvent>,
    user: selectedChatType
  ) => {
    e.preventDefault();
    setOpenContextMenu((prev) => (prev === user.id ? "" : user.id));
  };

  const deletechat = (deletedChatId: string) => {
    setSetFilterChats((prev) =>
      prev.filter(({ chatId }) => chatId !== deletedChatId)
    );
  };

    const searchUsers = (query:string) =>{
setSetFilterChats(recentChatUsers.filter((user) => user.name.includes(query.toLowerCase())))
  }


  return (
    <div className="px-3 py-1 w-full hide-scrollbar md:px-1 overflow-y-auto  max-h-[75vh] ">
      <h2 className="text-[1.2rem]  flex justify-center items-center gap-2 font-semibold mb-2">
        {" "}
        {logedInUser.isLogin
          ? connected
            ? ""
            : "connecting..."
          : "Login first "}{" "}
      </h2>

    <div className="relative ">
      <input placeholder="search" className="border rounded-lg px-3 py-2 w-full mb-2 outline-none" onChange={(e) =>searchUsers(e.target.value)} />
      <div  className="absolute  top-2 right-2"><IoSearch className="text-gray-600" size={22} /></div>
      </div>

      <ul className="flex flex-col gap-2 transition-all   min-h-[65vh]  ">
        <AiChatBot
          selectedUser={selectedUser}
          onSelectUser={onSelectUser}
          setOpenContextMenu={setOpenContextMenu}
          setChatId={setChatId}
        />

        {filterChats?.length > 0
          ? filterChats.map((user) => {
              return (
                <div
                    key={user.chatId}
                className="relative w-full  ">
                  <li
                    onContextMenu={(e) => handleContextMenu(e, user)}
                    className={`p-3 md:p-1 cursor-pointer  sm:w-full rounded-lg  b flex  ${
                      selectedUser?.id === user.id
                        ? "bg-[#008080d6] text-white"
                        : "bg-gray-200 "
                    }`}
                    onClick={() => {
                      onSelectUser(user);
                      setOpenContextMenu(null);
                      setChatId(user.chatId);
                    }}
                  >
                    <div className="flex   w-[3rem]  justify-start items-center gap-3 ">
                      <img
                        src={
                          user.profileUrl
                            ? user.profileUrl
                            : "https://github.com/shadcn.png"
                        }
                        className="rounded-full h-9 w-9 object-cover"
                        alt=""
                      />
                    </div>
                    <div className="flex flex-col justify-center bg   w-full items-start  px-3">
                      <div className="flex justify-between    w-full   items-center gap-3 ">
                        <div className="font-medium max-w-[10rem] text-primary2   overflow-hidden truncate">
                          {user?.name}
                        </div>
                        {onlineUsers &&
                        onlineUsers.map((u) => u).includes(user.id) ? (
                          <div className="bg-green-500  rounded-3xl h-2 w-2"></div>
                        ) : (
                          <div className="bg-gray-500  rounded-3xl h-2 w-2"></div>
                        )}
                      </div>
                      <div
                        className={`text-sm flex    justify-between w-full overflow-hidden truncate  ${
                          selectedUser?.id === user.id
                            ? "text-gray-200"
                            : "text-gray-500"
                        }`}
                      >
                        <span className="max-w-[8rem] overflow-hidden truncate">
                          {" "}
                          {userIsTyping.includes(user.id)
                            ? "Typing..."
                            : user?.lastMessage}
                        </span>
                        <div className="flex gap-1 justify-center items-center ">
                          {user.chatId !== selectedUser?.chatId &&
                          user?.unreadCount?.userId === logedInUser.id
                            ? user.unreadCount !== null &&
                              user.unreadCount?.unreadMessages !== 0 && (
                                <div className="text-white bg-blue-400 rounded-full h-4 w-4 flex items-center justify-center text-[0.6rem] p-2 text-center">
                                  {user.unreadCount?.unreadMessages}
                                </div>
                              )
                            : ""}
                          <span>
                            {" "}
                            {formatToLocalDateTime(user.lastMessageCreatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                  {openContextMenu === user.id && (
                    <ContextMenuDialogBox
                      open={openContextMenu}
                      setOpen={setOpenContextMenu}
                      userId={user.id}
                      deletechat={deletechat}
                      chatId={user.chatId}
                      setMessages={setMessages}
                      onSelectUser={onSelectUser}
                    />
                  )}
                </div>
              );
            })
          : connected
          ? "oops no chats available"
          : ""}
      </ul>
    </div>
  );
};

export default UserList;
