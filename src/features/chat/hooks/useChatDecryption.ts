import { decryptMessage } from "../../auth/crypto/decryptMessage";
import { importPrivateKey } from "../../auth/crypto/importPrivateKey";
import { getkeyFromIndexedDb } from "../../auth/storage/keyStorage";
import { selectedChatType } from "../types";

export const useChatDecryption = () => {
  const chatDecrypter = async (
    chats: selectedChatType[],
    logedInUserId: string,
  ) => {
    if (!logedInUserId) return;
    const privateKeyString = await getkeyFromIndexedDb();
    const privateKeyCrypto = await importPrivateKey(privateKeyString!);

    const decryptedChats = (
      await Promise.all(
        chats.map(async (chat) => {
          if (chat?.lastMessageType === "TEXT") {
            if (chat.senderId === logedInUserId) {
              const decryptedMessage = await decryptMessage(
                chat.lastMessageForSender,
                privateKeyCrypto,
              );

              chat.lastMessage = decryptedMessage || "";
              return chat;
            } else {
              if (privateKeyCrypto) {
                const decryptedMessage = await decryptMessage(
                  chat.lastMessageForReceiver,
                  privateKeyCrypto,
                );

                chat.lastMessage = decryptedMessage || "";
                return chat;
              }
            }
          } else {
            return {
              ...chat,
              lastMessage: "Type/Media",
            };
          }
        }),
      )
    ).filter((chat) => chat !== undefined);

    return decryptedChats;
  };

  return {
    chatDecrypter,
  };
};
