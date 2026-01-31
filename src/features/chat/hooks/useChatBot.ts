import React, { SetStateAction } from 'react'
import { MessageType } from '../types'

type useChatBotProps ={
    input:string
}

type sendMessageToChatBotProps = {
 sendMessageToBot :(state:string)=>void,
 setChatBotResponseLoading:React.Dispatch<SetStateAction<boolean>>
 msg:MessageType
}

export const useChatBot = ({input}:useChatBotProps) => {

    const sendMessageToChatBot = ({sendMessageToBot , setChatBotResponseLoading ,msg}:sendMessageToChatBotProps)=>{
                         const stringOldMessagesArray = sessionStorage.getItem("chat-bot-messages")
                      if(stringOldMessagesArray){
                      const oldMessages = JSON.parse(stringOldMessagesArray)
                      sessionStorage.setItem("chat-bot-messages",JSON.stringify([...oldMessages  , msg ]))
                      }else{
                      sessionStorage.setItem("chat-bot-messages",JSON.stringify([msg]))
                      }
                    setChatBotResponseLoading(true)
                    sendMessageToBot(input)

    }
  return {
    sendMessageToChatBot
  }
}

