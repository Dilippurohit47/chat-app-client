import { toast } from 'react-toastify';
import { getReceiverMessage, getSenderMessage } from '../utils/encryption';
import { MessageType, selectedChatType } from "../types";
import { newMessage } from '../utils/createNewMessage';
import  {v4 as uuid} from "uuid"
import { UserType } from '../../slices/userSlice';
import React, { SetStateAction, useState } from 'react';
import { useChatSocket } from './useChatSocket';
import { useSyncOfflineMessage } from './useSyncOfflineMessage';
import { uploadMediaToS3 } from '../../lib/uploadMediaToS3';
import { MediaFileType } from '../components/ChatWindow';
import { useChatBot } from './useChatBot';
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

export const useSendMessage = ({ ws,messages ,isLogin,senderId ,chatId, input,setInput ,receiver ,logedInUser ,setMessages ,setChatBotResponseLoading,clearDraftForReceiver,setMediaFile}:useSendMessageProps
) => {


      const {sendMessageToBot  ,sendMessageToUser  ,sendMedia} = useChatSocket({ws:ws , senderId:logedInUser.id ,setMessages:setMessages ,selectedUser:receiver , messages:messages  ,setChatBotResponseLoading})
      const {savePendingOfflineMessages} = useSyncOfflineMessage({ws:ws,senderId})

      const [sendedFiles, setSendedFiles] = useState<sendedFileType[] | []>([]);
const {sendMessageToChatBot} = useChatBot({input})

     const sendMessage = async () => {
        if (!isLogin ) return toast.error("Login first ");

        let tempId = uuid()


        const msg = newMessage({
            senderId,
            receiverContent: input,
            senderContent:input,
            receiverId: receiver.id!,
            isMedia: false,
            tempId: tempId,
            error: false,
            uploading: false,
          status:receiver.id === "chat-bot" ? "sent" : "pending",
          chatId:chatId,
          });
          setMessages((prev) => [msg, ...prev]);
        clearDraftForReceiver(receiver.id)
        setInput("");

                    if(receiver.id === "chat-bot"){
                     sendMessageToChatBot({sendMessageToBot,setChatBotResponseLoading ,msg})
                     return
}   
         const receiverContent = await getReceiverMessage({text:input , publickey:receiver.publickey})
        const senderContent = await getSenderMessage({text:input,publickey:logedInUser.publickey!})
        // offline save message 
        if (!navigator.onLine) {
          if(!receiverContent || !senderContent) return
          const msg:MessageType = newMessage({
            senderId:logedInUser.id!,
            receiverContent: input,
            senderContent: input, 
            receiverId: receiver.id,
            isMedia: false,
            tempId: tempId,
            error: false,
            uploading: false,
          status:"pending",
          chatId:receiver.chatId,
          });
    
       savePendingOfflineMessages(msg , receiverContent , senderContent)
          setMessages((prev) => [msg, ...prev]);
          setInput("");
          return;
        }
        if (!ws) return toast.error("server error!");
          
        if (sendedFiles.length <= 0) {
          if(!receiverContent  || !senderContent){
            window.alert(" encryption Failed try again")
            return
          }
        sendMessageToUser({receiverContent , senderContent,chatId , tempId ,receiverId:receiver.id})
        }
    
        if (sendedFiles.length > 0) {
          sendedFiles.forEach(async (img) => {
            const tempId: string = uuid();
            const msg = newMessage({
              senderId,
              receiverContent: img.url,
              senderContent:img.url,
              receiverId: receiver.id!,
              isMedia: true,
              tempId: tempId,
              error: false,
              uploading: true,
          status:"pending",
          chatId:chatId
            });
            setMessages((prev) => [msg, ...prev]);
    
            setMediaFile((prev) =>
              prev.filter((img) => img.imageId !== img.imageId)
            );
    
        try {           
              const signedInUrl =   await uploadMediaToS3(img) 
                sendMedia({signedInUrl:signedInUrl , receiverId:receiver.id , chatId:chatId})
    
                setSendedFiles((prev) =>
                  prev.filter((img) => img.imageId !== img.imageId)
                );
                setMessages((prev) =>
                  prev.map((msg) => {
                    if (msg?.tempId === tempId) {
                      return {
                        ...msg,
                        uploading: false,
                        error: false,
                      };
                    } else {
                      return msg;
                    }
                  })
                );
            
        } catch (error) {
          console.log("Error in uplaoding image",error)
                setSendedFiles((prev) =>
                  prev.filter((img) => img.imageId !== img.imageId)
                );
    
                setMessages((prev) =>
                  prev.map((msg) => {
                    if (msg?.tempId === tempId) {
                      return {
                        ...msg,
                        uploading: false,
                        error: true,
                        errorMessage:"Retry"
                      };
                    } else {
                      return msg;
                    }
                  })
                );
        }
          });
        } 
      };



  return {
sendMessage,
setSendedFiles,
  }
}

