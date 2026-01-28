import React, { SetStateAction, useEffect, useRef } from "react";
import { MessageType, selectedChatType } from "../types";
import { decryptMessage, getkeyFromIndexedDb, importPrivateKey } from "../../lib/helper";
import { newMessage } from "../utils/createNewMessage";

interface useChatSocketTypes {
  ws: WebSocket | null;
  senderId: string | null;
  selectedUser?:selectedChatType
  setMessages?:React.Dispatch<SetStateAction<MessageType[]>>
  messages?:MessageType[],
  setChatBotResponseLoading?:React.Dispatch<SetStateAction<boolean>>
}

type SendMessageToUserPayload = {
  receiverId: string;
  chatId: string | null;
  tempId: string;
  receiverContent: string;
  senderContent: string;
};

type sendMediaPayload = {
    signedInUrl:string,
    receiverId:string,
    chatId:string,
}

export const useChatSocket = ({ ws, senderId , selectedUser ,setMessages ,messages  ,setChatBotResponseLoading }: useChatSocketTypes) => {

    const privateKeyRef = useRef<CryptoKey | null>(null);
    const loadingRef = useRef(false);

  useEffect(() => {
    const loadPrivateKey = async () => {
      if (privateKeyRef.current) return;
      if (loadingRef.current) return; 
      loadingRef.current = true;

      try {
        const privateKeyString = await getkeyFromIndexedDb();
        if (!privateKeyString) throw new Error("Private key not found in IndexedDB");

        const privateKeyCrypto = await importPrivateKey(privateKeyString);
        privateKeyRef.current = privateKeyCrypto; 
      } catch (err) {
        console.error("Failed to load private key", err);
      } finally {
        loadingRef.current = false;
      }
    };
    loadPrivateKey();
  }, []);

  const sendMessageToUser = ({
    receiverContent,
    senderContent,
    chatId,
    tempId,
    receiverId,
  }: SendMessageToUserPayload) => {
    if(!ws) return
    ws.send(
      JSON.stringify({
        type: "personal-msg",
        receiverContent: receiverContent,
        senderContent: senderContent,
        receiverId: receiverId,
        senderId,
        chatId,
        tempId: tempId,
      }),
    );
  };

  const sendMessageToBot = (input:string) => {
    if(!ws) return
    ws.send(
      JSON.stringify({
        type: "get-chatbot-response",
        query: input,
        receiverId: senderId,
      }),
    );
  };

  const sendMedia = ({signedInUrl  , receiverId , chatId}:sendMediaPayload)=>{
    if(!ws) return
   ws.send(
              JSON.stringify({
                type: "personal-msg",
                message: signedInUrl,
                receiverId: receiverId,
                senderId,
                chatId,
                isMedia: true,
              })
            );
  }


  useEffect(() => {
    if (!ws || !selectedUser) return;
    const getMessage =  async(m: MessageEvent) => {
      const data = JSON.parse(m.data);
      if (data.type === "personal-msg") {
        if (
          (data.receiverId === senderId &&
            data.senderId === selectedUser.id) ||
          (data.senderId === senderId &&
            data.receiverId === selectedUser.id) 
        ) {

          if(!privateKeyRef.current){
            return
          }
          const decryptedMessage = await decryptMessage(data.receiverContent , privateKeyRef.current)
          const msg = newMessage({
            senderId: data.senderId,
            receiverContent: decryptedMessage || "",
            senderContent: data.senderContent,
            receiverId: data.receiverId,
            isMedia: data.isMedia,
            tempId: data.id,
            error: false,
            uploading: false,
            chatId:selectedUser.chatId,
          });

          setMessages((prev) => [msg, ...prev]);  
        }
      }
      if (data.type === "chatbot-reply") {
          const msg = newMessage({
            senderId: "ai-chat-bot",
            receiverContent: data.answer,
            senderContent:"chatbot",
            receiverId: data.receiverId,
            isMedia: data.isMedia || false,
            tempId: " 0",
            error: false,
            uploading: false,
            chatId:"chat-bot"
          });


             const stringOldMessagesArray = sessionStorage.getItem("chat-bot-messages")
          if(stringOldMessagesArray){
          const oldMessages = JSON.parse(stringOldMessagesArray)
          sessionStorage.setItem("chat-bot-messages",JSON.stringify([...oldMessages  , msg ]))
          }else{
          sessionStorage.setItem("chat-bot-messages",JSON.stringify([messages , msg]))
          }

          setMessages((prev) => [msg, ...prev]);
          setChatBotResponseLoading(false)
        }
if (data.type === "message-acknowledge") {
  const updates = data.messages;

  console.log("msg",updates)
  setMessages((prev) =>
    prev.map((msg) => {
      const matched = updates.find(
        (m) =>
          m.id === msg.tempId );

      if (!matched) return msg;

      return {
        ...msg,
        status: matched.status,
      };
    })
  );
}

    };
    ws.addEventListener("message", getMessage);
    return () => {
      ws.removeEventListener("message", getMessage);
    };
  }, []);


  useEffect(()=>{
if(!ws || !selectedUser) return
    ws.send(JSON.stringify({
  type:"message-acknowledge",
  senderId:selectedUser.id,
  receiverId:senderId,
  chatId:selectedUser.chatId,
}))
  },[])



  return {
    sendMessageToBot,
    sendMessageToUser,
    sendMedia,
  };
};
