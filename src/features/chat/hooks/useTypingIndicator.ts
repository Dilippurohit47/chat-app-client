import { RefObject, useEffect, useRef } from "react";

    type useTypingIndicatorprops = {
        ws:WebSocket  | null,
        receiverId:string,
        senderId:string,
        messageInputRef:RefObject<HTMLInputElement | null>
    }

    export const useTypingIndicator = ({ws,receiverId , senderId, messageInputRef }:useTypingIndicatorprops)=>{
         const  typingTimerRef = useRef<any>(null);   
         
         
  // stop typing if click outside input
  useEffect(() => {
    if (!receiverId) return;
    const handleClickOutSideMessageInput = (e: MouseEvent) => {
      if (
        messageInputRef.current &&
        !messageInputRef.current.contains(e.target as Node)
      ) {
        typingStop();
      }
    };

    window.addEventListener("click", handleClickOutSideMessageInput);

    return () => {
      window.removeEventListener("click", handleClickOutSideMessageInput);
    };
  }, []);



          const userIsTyping = () => {
            if (!ws) return;
            try {
              if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
               typingTimerRef.current =  setTimeout(()=>{
                 ws.send(
                JSON.stringify({
                  type: "typing",
                  senderId: senderId,
                  receiverId: receiverId,
                })
              );
              },200);
            //   prevConvertationref.current = selectedUser.id;
            } catch (error) {
              console.log("error in sending typing state", error);
            }
          };
        
        
          const typingStop = () => {
            if (!ws) return;
            ws.send(
              JSON.stringify({
                receiverId: receiverId,
                type: "typing-stop",
                senderId: senderId,
              })
            );
          };

        return {
            userIsTyping,
            typingStop,
        }
    }