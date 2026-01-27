import { useRef } from "react";

    type useTypingIndicatorprops = {
        ws:WebSocket  | null,
        receiverId:string,
        senderId:string
    }

    export const useTypingIndicator = ({ws,receiverId , senderId}:useTypingIndicatorprops)=>{
         const  typingTimerRef = useRef<any>(null);        
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