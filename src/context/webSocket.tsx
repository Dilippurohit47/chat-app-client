// context/WebSocketContext.tsx
import { createContext, useRef, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { onlineUsersType } from "../types/index";
import { WebSocketContextType } from "../types";



const WebSocketContext = createContext<WebSocketContextType | null>(null);
 
export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const ws = useRef<WebSocket | null>(null);
  const connectionBooleanRef = useRef<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<onlineUsersType[]>([]);

  const user = useSelector((state: RootState) => state.user);
  const [connected, setConnected] = useState<boolean>(false);

  let tryLimit = 2;
const params = new URLSearchParams(window.location.search);
const PORT = params.get("port");
  useEffect(() => {
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
          ws.current.addEventListener("message", handleMessages);
          connectionBooleanRef.current = true;
          setConnected(true);
        }
      };
      ws.current.onclose = () => {
        console.log("WebSocket connection closed");
        tryLimit += 1;
        setConnected(false);
        connectionBooleanRef.current = false;
        const intervalId = setInterval(() => {
          if (!connectionBooleanRef.current && tryLimit > 0) {
            console.log("trying to connect again", tryLimit);
            connect();
            tryLimit -= 1;
          } else {
            clearInterval(intervalId);
          } 
        }, 2000);
      };
    };

    const handleMessages = (m: MessageEvent) => {
      const data = JSON.parse(m.data);
      if (data.type === "online-users") {
        const filterData = data?.onlineUsers.filter(
          (c: onlineUsersType) => c !== user.id
        );
        setOnlineUsers(filterData);
      }
      if(data.type === "pong"){
        const Latency = Date.now() - data.start
        const serverLatency = Date.now() - data.newStart
        console.log("RTT latency" + Latency  + "ms")
        console.log(" server latency" + serverLatency  + "ms")
      }
    };

    connect();




    return () => {
      if (ws.current) {
        ws.current.close(1000);
      }
      ws.current?.removeEventListener("message", handleMessages);
    };
  }, [user]);


  useEffect(() => {
  const interval = setInterval(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: "pings" }));}
  }, 10000);
  return () => clearInterval(interval);
}, []);

  return (
    <WebSocketContext.Provider
      value={{ ws, connected, setConnected, connectionBooleanRef, onlineUsers }}
    >
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
