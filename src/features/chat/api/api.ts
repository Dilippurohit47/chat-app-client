import { axios } from "../../../apiClient";
import { MessageType, selectedChatType } from "../types";

export type GetChatMessagesResponse = {
  messages: MessageType[]; // replace later with MessageType[]
  cursor: string | null;
  hasMore: boolean;
};

export const getChatMessages = async (
  senderId: string,
  receiverId: string,
): Promise<GetChatMessagesResponse> => {
  const res = await axios.get<GetChatMessagesResponse>("/chat/get-messages", {
    params: {
      senderId,
      receiverId,
      limit: 20,
      cursor: undefined,
    },
  });
  return res.data;
};

export const updateUnreadCount = async (
  senderId: string,
  chatId: string,
  receiverId: string,
):Promise<void> => {
  await axios.put(`/chat/update-unreadmessage-count`,
    {
      senderId: senderId,
      chatId: chatId,
      receiverId: receiverId,
    },
  );
};

export const fetchOlderMessages = async (
  senderId: string,
  receiverId: string,
  cursorId: string | null,
): Promise<GetChatMessagesResponse> => {
  const res = await axios.get<GetChatMessagesResponse>(
    `${import.meta.env.VITE_BASE_URL_HTTP}/chat/get-messages`,
    {
      params: {
        senderId: senderId,
        receiverId: receiverId,
        limit: 20,
        cursor: JSON.stringify(cursorId),
      },
    },
  );
  return res.data;
};

type  fetchRecentChatApiResponse = {
 chats:selectedChatType[]
}


export const fetchRecentChats =  async():Promise<selectedChatType[]>=>{
 const res =   await axios.get<fetchRecentChatApiResponse>(
          `${import.meta.env.VITE_BASE_URL_HTTP}/chat/get-recent-chats`
        );

        return res.data.chats
}
