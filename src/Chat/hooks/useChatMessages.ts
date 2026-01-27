// src/hooks/useChatMessages.ts
import { useState } from "react";
import axios from "axios";
import { MessageType } from "../../types/index";
import { decryptMessage, getkeyFromIndexedDb, importPrivateKey } from "../../lib/helper";

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
    if (!receiverId) return;

    try {
      setLoadingInitial(true);

        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL_HTTP}/chat/get-messages`,
          {
            params: {
              senderId: senderId,
              receiverId: receiverId,
              limit: 20,
              cursor: undefined,
            },
          }
        );
        if (res.status === 200) {
         const privateKeyString = await getkeyFromIndexedDb();
  const privateKeyCrypto = await importPrivateKey(privateKeyString!);

  const decryptedMessages = await Promise.all(
    res.data.messages.map(async (msg: any) => {
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
  setCursorId(res.data.cursor);
  setHasMore(res.data.hasMore);
        }
    } catch (err) {
      setMessages([]);
      console.log(err);
    } finally {
      setLoadingInitial(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!receiverId) return;
    if (!cursorId) return;
    if (!hasMore) return;

    try {
      setLoadingMoreMessages(true);
          const res = await axios.get(`${import.meta.env.VITE_BASE_URL_HTTP}/chat/get-messages`,
            {
              params: {
                senderId: senderId,
                receiverId: receiverId,
                limit: 20,
                cursor: JSON.stringify(cursorId),
              },
            }
          );
  if (res.status === 200) {
         const privateKeyString = await getkeyFromIndexedDb();
  const privateKeyCrypto = await importPrivateKey(privateKeyString!);

  const decryptedMessages = await Promise.all(
    res.data.messages.map(async (msg: any) => {
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
  setCursorId(res.data.cursor);
  setHasMore(res.data.hasMore);
        }
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
