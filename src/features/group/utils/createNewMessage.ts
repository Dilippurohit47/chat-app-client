interface MessageParams {
  senderId:string,
  input:string,
  groupId:string,
  messageId?:string,
}

export const newMessage =({senderId,input,groupId,messageId}:MessageParams) =>{
  return {
    MessageId:messageId,
    senderId:senderId,
    content:input,
    groupId:groupId 
  }
}