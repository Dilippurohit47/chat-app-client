import { newMessage } from "../utils/createNewMessage"
import { IncomingGroupMessagePayload, SelectedGroupType } from "../types"
import { useEffect } from "react"

type useGroupSocketProps = {
    ws:WebSocket | null,
    senderId:string,
    selectedGroup:SelectedGroupType,
    onIncomingGroupMessage: (data:IncomingGroupMessagePayload) => void
}

export const useGroupsocket =({ws,senderId , selectedGroup,onIncomingGroupMessage}:useGroupSocketProps)=>{


    useEffect(() =>{
      if(!ws) return 
      const handleMessage =(e:MessageEvent) =>{
        const data = JSON.parse(e.data)
        if(data.type === "group-message"){
            onIncomingGroupMessage(data)
        }
      }
      ws.addEventListener("message",handleMessage)
      return () =>{
        ws.removeEventListener("message",handleMessage)
      }
    },[])

      const sendMessage =(input:string) =>{
        if(!ws) return
        const msg = newMessage({senderId,input,groupId:selectedGroup.id})
    ws.send(JSON.stringify({
      type:"group-message",
      groupId:selectedGroup.id,
      message:msg,
    }))
    return msg
      }
      return {
        sendMessage
      }
}