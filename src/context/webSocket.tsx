// context/WebSocketContext.tsx
import { createContext, useRef, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";

const WebSocketContext = createContext<WebSocket | null>(null);

export const WebSocketProvider = ({ children }) => {
  const ws = useRef<WebSocket | null>(null);
  const connectionBooleanRef = useRef<boolean>(false);
  const user = useSelector((state: RootState) => state.user);
  const [connected, setConnected] = useState<boolean>(false);

useEffect(() =>{
 
  if (!user.isLogin) return;
//  const serverPort = new URLSearchParams(window.location.search).get("port") || 8000;
    const connect = async () => {
      ws.current = new WebSocket(`ws://localhost:${8000}`);
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


      ws.current.onclose = () => {
        console.log("WebSocket connection closed");
        setConnected(false);
        connectionBooleanRef.current = false;
        const intervalId = setInterval(() => {
          if (!connectionBooleanRef.current) {
            console.log("trying");
            connect();
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
    <WebSocketContext.Provider value={{ws , connected ,setConnected ,connectionBooleanRef}}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
