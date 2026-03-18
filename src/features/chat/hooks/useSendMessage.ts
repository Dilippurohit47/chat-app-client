import { toast } from 'react-toastify';
import { encryptMessage } from '../../auth/crypto/encyptMessage';
import { MessageType, selectedChatType } from "../types";
import { newMessage } from '../utils/createNewMessage';
import  {v4 as uuid} from "uuid"
import { UserType } from '../../../slices/userSlice';
import React, { SetStateAction, useState } from 'react';
import { useChatSocket } from './useChatSocket';
import { useSyncOfflineMessage } from './useSyncOfflineMessage';
import { MediaFileType } from '../components/ChatWindow';
import { useChatBot } from './useChatBot';
import { uploadFileToS3 } from '../../../utils/uploadFileToS3';
type useSendMessageProps ={
    ws:WebSocket  | null,
    messages:MessageType[]
isLogin:boolean,
input:string,
receiver:selectedChatType,
logedInUser:UserType,
setMessages:React.Dispatch<SetStateAction<MessageType[] | []>>,
setInput:React.Dispatch<SetStateAction<string>>,
setChatBotResponseLoading:React.Dispatch<SetStateAction<boolean>>,
chatId:string,
senderId:string,
clearDraftForReceiver:(state:string)=>void,
setMediaFile:React.Dispatch<SetStateAction<MediaFileType[] | [] >>
}

interface sendedFileType {
  imageId: string;
  file: File;
  url: string;
}

export const useSendMessage = ({ ws,messages ,isLogin,senderId ,chatId, input,setInput ,receiver ,logedInUser ,setMessages ,setChatBotResponseLoading,clearDraftForReceiver,setMediaFile }:useSendMessageProps
) => {


      const {sendMessageToBot  ,sendMessageToUser  ,sendMedia} = useChatSocket({ws:ws , senderId:logedInUser.id ,setMessages:setMessages ,selectedUser:receiver , messages:messages  ,setChatBotResponseLoading})
      const {savePendingOfflineMessages} = useSyncOfflineMessage({ws:ws,senderId})

      const [sendedFiles, setSendedFiles] = useState<sendedFileType[] | []>([]);


const {sendMessageToChatBot} = useChatBot({input})

const sendTextMessage = async () => {
  if(input.trim().length === 0) return
  const tempId = uuid();

    const msg = newMessage({
    senderId,
    receiverContent: input,
    senderContent: input,
    receiverId: receiver.id!,
    isMedia: false,
    tempId,
    uploading: false,
    error: false,
    status: "pending",
    chatId
  });

  if(chatId === "ai-chat-bot"){
    sendMessageToChatBot({sendMessageToBot , setChatBotResponseLoading , msg})
  }


  if(chatId !==  "ai-chat-bot"){
  const receiverContent = await encryptMessage({
    text: input,
    publicKeyPem: receiver.publickey
  });

  const senderContent = await encryptMessage({
    text: input,
    publicKeyPem: logedInUser.publickey!
  });

  sendMessageToUser({
    receiverContent,
    senderContent,
    chatId,
    tempId,
    receiverId: receiver.id
  });
  }


  setMessages(prev => [msg, ...prev]);
  setInput("");

};


const sendMediaMessage = async () => {
  setMediaFile([])
  for (const img of sendedFiles) {

    const tempId = uuid();

    const msg = newMessage({
      senderId,
      receiverContent: img.url,
      senderContent: img.url,
      receiverId: receiver.id!,
      isMedia: true,
      tempId,
      uploading: true,
      error: false,
      status: "pending",
      chatId
    });

    setMessages(prev => [msg, ...prev]);

    try {

      const signedUrl = await uploadFileToS3(img.file);

      sendMedia({
        signedInUrl: signedUrl,
        receiverId: receiver.id,
        chatId,
        tempId
      });

      setMessages(prev =>
        prev.map(m =>
          m.tempId === tempId
            ? { ...m, uploading: false }
            : m
        )
      );

    } catch (err) {

      setMessages(prev =>
        prev.map(m =>
          m.tempId === tempId
            ? { ...m, uploading: false, error: true }
            : m
        )
      );

    }
  }
  setSendedFiles([]);

};

const sendMessage = async () => {
  if (!isLogin) return toast.error("Login first");



  if (sendedFiles.length > 0) {
    await sendMediaMessage();
  } else {
    await sendTextMessage();
  }
};

  return {
sendMessage,
setSendedFiles,
  }
}

