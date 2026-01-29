// src/hooks/useChatMessages.ts
import { useState } from "react";
import { MessageType } from "../types";
import { decryptMessage, getkeyFromIndexedDb, importPrivateKey } from "../../../lib/helper";
import { fetchOlderMessages, getChatMessages } from "../api/api";

type UseChatMessagesParams = {
  senderId: string | null;
  receiverId: string | null;
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
};

export function useChatMessages({ senderId, receiverId, setMessages }: UseChatMessagesParams) {
  const [cursorId, setCursorId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);

  const loadInitialMessages = async () => {
    if (!receiverId || !senderId || receiverId  === "chat-bot") return;
    try {
      setLoadingInitial(true);
const  data = await getChatMessages(senderId ,receiverId)
         const privateKeyString = await getkeyFromIndexedDb();
  const privateKeyCrypto = await importPrivateKey(privateKeyString!);

  const decryptedMessages = await Promise.all(
    data.messages.map(async (msg: any) => {
      if(msg.senderId === senderId){
         const decryptedText = await decryptMessage(msg.senderContent, privateKeyCrypto);
      return { ...msg,senderContent:decryptedText};
      }
      if(msg.senderId === receiverId){
         const decryptedText = await decryptMessage(msg.receiverContent, privateKeyCrypto);
      return { ...msg,receiverContent:decryptedText };
      }
    })
  );

  setMessages(decryptedMessages);
  setCursorId(data.cursor);
  setHasMore(data.hasMore);
    } catch (err) {
      setMessages([]);
      console.log(err);
    } finally {
      setLoadingInitial(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!receiverId || !senderId  || !cursorId || !hasMore) return;

    try {
      setLoadingMoreMessages(true);
          const data = await fetchOlderMessages(senderId , receiverId ,cursorId)
         const privateKeyString = await getkeyFromIndexedDb();
  const privateKeyCrypto = await importPrivateKey(privateKeyString!);

  const decryptedMessages = await Promise.all(
    data.messages?.map(async (msg: any) => {
      if(msg.senderId === senderId){
         const decryptedText = await decryptMessage(msg.senderContent, privateKeyCrypto);
      return { ...msg,senderContent:decryptedText};
      }
      if(msg.senderId === receiverId){
         const decryptedText = await decryptMessage(msg.receiverContent, privateKeyCrypto);
      return { ...msg,receiverContent:decryptedText };
      }
    })
  );

  setMessages((prev)=>[...prev,...decryptedMessages]);
  setCursorId(data.cursor);
  setHasMore(data.hasMore);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingMoreMessages(false);
    }
  };

  return {
    cursorId,
    hasMore,
    loadingInitial,
    loadingMoreMessages,
    loadInitialMessages,
    loadMoreMessages,
  };
}
