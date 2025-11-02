// context/WebSocketContext.tsx
import { createContext, useRef, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { onlineUsersType } from "../components/totalUserList";


export interface WebSocketContextType {
  ws: React.MutableRefObject<WebSocket | null>;
  connected: boolean;
  setConnected: React.Dispatch<React.SetStateAction<boolean>>;
  connectionBooleanRef: React.MutableRefObject<boolean>;
  onlineUsers: string[];
}


const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }:{children:React.ReactNode}) => {
  const ws = useRef<WebSocket | null>(null);
  const connectionBooleanRef = useRef<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<onlineUsersType[]>([]);

  const user = useSelector((state: RootState) => state.user);
  const [connected, setConnected] = useState<boolean>(false);

        let tryLimit = 2


useEffect(() =>{
 
  if (!user.isLogin) return;
    const connect = async () => {
      ws.current = new WebSocket(`${import.meta.env.VITE_BASE_URL_WS}`);
     ws.current.onopen = () => {
         if (ws.current?.readyState === WebSocket.OPEN) {
           ws.current.send(
             JSON.stringify({
               type: "user-info",
               userId: user.id,
             })
           );
           connectionBooleanRef.current = true;
           setConnected(true)
         }
       };

         ws.current.onmessage=(m) =>{
 const data = JSON.parse(m.data);
        if (data.type === "online-users") {
          console.log("online ",data)
          const filterData = data?.onlineUsers.filter(
            (c: onlineUsersType) => c !== user.id
          );
          console.log("online",filterData)
          setOnlineUsers(filterData);
        }

      
        }
      ws.current.onclose = () => {
        console.log("WebSocket connection closed");
        tryLimit += 1
        setConnected(false);
        connectionBooleanRef.current = false;
        const intervalId = setInterval(() => {
          if (!connectionBooleanRef.current && tryLimit > 0) {
            console.log("trying to connect again",tryLimit);
            connect();
            tryLimit -= 1
          } else {
            clearInterval(intervalId);
          }
        }, 500);
      };
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.close(1000);
      }
    };

},[user])

  return (
    <WebSocketContext.Provider value={{ws , connected ,setConnected ,connectionBooleanRef ,onlineUsers}}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
