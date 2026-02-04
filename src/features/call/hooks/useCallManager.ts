import { RefObject, useEffect, useState } from "react";
import { incomingCallType } from "../types";


type useCallManagerProps = {
    ws:RefObject<WebSocket | null>
    connected:boolean
}

export const useCallManager = ({ws , connected}:useCallManagerProps)=>{

      const [incomingCall, setIncomingCall] = useState<incomingCallType | null>(
        null,
      );
     const [showCallNotification, setShowCallNotification] =
    useState<boolean>(false);
    const [callAccepted, setCallAccepted] = useState<boolean>(false);


     useEffect(() => {
    if (!ws.current) return;
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
        if (data.callStatus === "hang-up") {
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


  const callIsAccepted = ()=>{
    setShowCallNotification(false)
    setCallAccepted(true)

  }

  const callIsIgnored = ()=>{
    setShowCallNotification(false)
  }

  const callIsEnded =()=>{
    setCallAccepted(false)
  }

   const callRejected = () => {
    if (!incomingCall?.callerId) return;
    ws.current?.send(
      JSON.stringify({
        type: "call-status",
        callStatus: "hang-up",
        callReceiverId: incomingCall?.callerId,
      }),
    );
  };


    return {
        showCallNotification,
        incomingCall,
        callIsAccepted,
        callAccepted,
        callIsIgnored,
        callIsEnded,
        callRejected
    }
}