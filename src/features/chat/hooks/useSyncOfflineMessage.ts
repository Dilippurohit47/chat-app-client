import { MessageType } from "../types";
import { useChatSocket } from "./useChatSocket";

type useSyncOfflineMessageProps = {
  ws: WebSocket | null;
  senderId: string | null;
};

export const useSyncOfflineMessage = ({
  ws,
  senderId,
}: useSyncOfflineMessageProps) => {
  const { sendMessageToUser } = useChatSocket({ ws, senderId });

  const savePendingOfflineMessages = (msg: MessageType , receiverContent:string ,senderContent:string) => {

    let encryptedMessage  = {...msg}
    encryptedMessage.senderContent = senderContent
    encryptedMessage.receiverContent = receiverContent

    const existing = JSON.parse(
      localStorage.getItem("pendingMessages") || "[]",
    );
    existing.push(encryptedMessage);
    localStorage.setItem("pendingMessages", JSON.stringify(existing));
  };

  const syncOfflineSaveMessages = () => {
        if (!ws || !senderId) return;
    const offlineMessages = JSON.parse(
      localStorage.getItem("pendingMessages") || "[]",
    );
    if (offlineMessages && offlineMessages.length > 0) {
      offlineMessages.forEach((msg: MessageType) => {
        sendMessageToUser({
          receiverContent: msg.receiverContent,
          senderContent: msg.senderContent,
          chatId: msg.chatId,
          tempId: msg.tempId,
          receiverId: msg.receiverId,
        });
      });
    }
    localStorage.removeItem("pendingMessages");
  };
  return {
    savePendingOfflineMessages,
    syncOfflineSaveMessages,
  };
};
