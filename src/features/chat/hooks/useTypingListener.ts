import { useEffect, useRef, useState } from "react";


interface useTypingListenerProps {
    ws:WebSocket  | null,
    isConnected:boolean
}

export const useTypingListener = ({ws , isConnected}:useTypingListenerProps)=>{

      const [userIsTyping, setUserIsTyping] = useState<string[]>([]);
      const timersRef = useRef<Map<string, number>>(new Map());

// call these when "user-start-typing" received
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

  useEffect(() => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const messageHandler = async (m: any) => {
      const data = JSON.parse(m.data);
      if (data.type === "user-is-typing") {
        onUserIsTyping(data.senderId)
      }
      if (data.type === "user-stopped-typing") {
      onUserStoppedTyping(data.senderId)
      }
    };
 
    ws.addEventListener("message", messageHandler);
    return () => {
      ws.removeEventListener("message", messageHandler);
    };
  }, [isConnected]);

    useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, []);


return {
userIsTyping
}
}