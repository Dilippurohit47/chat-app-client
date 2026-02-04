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
       await clearChatWithId(currentUserId ,chatId)
        return true
    } catch (error) {
        return false
    }
  };


  const deleteChat = async()=>{
    try {
        if(!currentUserId || !chatId) return
        await deleteChatWithId(currentUserId , chatId)
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
