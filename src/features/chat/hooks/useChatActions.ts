import { clearChatWithId, deleteChatWithId } from "../api/api";

type useChatActionsProps = {
  currentUserId: string | null;
  chatId: string;
};

export const useChatActions = ({
  currentUserId,
  chatId,
}: useChatActionsProps) => {


  const clearChat = async () => {
    if(!currentUserId || !chatId) return
    try {
       await clearChatWithId(chatId)
        return true
    } catch (error) {
        return false
    }
  };


  const deleteChat = async()=>{
    try {
        if(!chatId) return
        await deleteChatWithId(chatId)
        return true
    } catch (error) {
        return false
    }
  }


  return {
    clearChat,
    deleteChat
  };
};
