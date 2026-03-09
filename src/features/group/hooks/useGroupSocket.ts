import { newMessage } from "../utils/createNewMessage"
import { IncomingGroupMessagePayload, SelectedGroupType } from "../types"
import { useEffect } from "react"
import { useWebSocket } from "../../../context/webSocket"

type useGroupSocketProps = {
    ws:WebSocket | null,
    senderId:string,
    selectedGroup:SelectedGroupType,
    onIncomingGroupMessage: (data:IncomingGroupMessagePayload) => void
}

export const useGroupsocket =({ws,senderId , selectedGroup,onIncomingGroupMessage}:useGroupSocketProps)=>{
  const {subscribe ,unsubscribe} = useWebSocket()
    useEffect(() =>{
      if(!ws) return 
      const handleMessage =(e:MessageEvent) =>{
        const data = JSON.parse(e.data)
        if(data.type === "group-message"){
            onIncomingGroupMessage(data)
        }
      }
      subscribe(handleMessage)
      return () =>{
        unsubscribe(handleMessage)
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