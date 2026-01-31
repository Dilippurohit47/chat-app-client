  export function newMessage({
    senderId,
    receiverContent,
    senderContent,
    receiverId,
    tempId,
    isMedia = false,
    uploading = false,
    error = false,
    status= "pending",
    chatId ,
  }: {
    senderId: string;
    senderContent:string,
    receiverContent:string,
    receiverId: string;
    tempId?: string;
    uploading?: boolean;
    isMedia?: boolean;
    error?: boolean;
    status?:string;
    chatId:string
  }) {
    return {
      tempId: tempId || "0",
      senderId: senderId,
      receiverContent: receiverContent,
      senderContent: senderContent,
      receiverId: receiverId,
      chatId: chatId,
      createdAt: Date.now(),
      isMedia: isMedia,
      uploading: uploading,
      error: error,
      status:status,
    };
  }