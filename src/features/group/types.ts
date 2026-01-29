import { SetStateAction } from "react";
import { UserType } from "../../slices/userSlice";

export type members = {
  groupId: string;
  id: string;
  user: UserType;
  userId: string;
}; 
export interface UserTypes {
  id: string;
  name: string;
  email: string;
  isLogin: boolean;
  profileUrl: string | undefined;
}

export  interface GroupChatWindowPropsType {
  ws:WebSocket | null,
  senderId:string,
  selectedGroup:SelectedGroupType,
  setSelectedGroup:React.Dispatch<React.SetStateAction<SelectedGroupType | null >>
  logedInUser:UserType
}

export interface SelectedGroupType {
  id: string;
  name: string;
  groupProfilePicture?: string;
  members: members[];
  lastMessage?: string;
  description?: string;
}

export interface GroupMessageType {
  id?:string
  content:string,
  senderId:string,
  groupId:string,
  isMedia?:boolean,
}

 
export type IncomingGroupMessagePayload = {
  MessageId: string;
  senderId: string;
  content: string;
  groupId: string;
};
 
 export type groupInfoProps = {
 group:SelectedGroupType,
 showGroupInfo:boolean,
 setShowGroupInfo:(State:boolean)=>void;
 groupInfoButtonRef:React.RefObject<HTMLDivElement | null> 
 userId:string | null
 setSelectedGroup:React.Dispatch<SetStateAction<SelectedGroupType | null >>
 }
 
 export type GroupListType = {
   connected: boolean;
   logedInUser: UserType;
   selectedGroup:SelectedGroupType | null,
   setSelectedGroup : React.Dispatch<React.SetStateAction<SelectedGroupType | null>>
 };

 export interface AddMoreMembersPropsType {
  userId:string,
  selectedGroup:SelectedGroupType
} 