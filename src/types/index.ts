import { SetStateAction } from "react";
import { UserType } from "../slices/userSlice";
import { MessageType } from "../Chat/types";

export type members = {
  groupId: string;
  id: string;
  user: UserType;
  userId: string;
}; 


export interface SelectedGroupType {
  id: string;
  name: string;
  groupProfilePicture?: string;
  members: members[];
  lastMessage?: string;
  description?: string;
}

export type unreadCountType = {
  unreadMessages: number;
  userId: string;
};

export interface selectedChatType {
  name: string;
  chatId: string;
  createdAt: Date;
  email: string;
  id: string;
  lastMessage: string;
  lastMessageCreatedAt: string;
  lastMessageForReceiver:string,
  lastMessageForSender:string,
  senderId:string,
  receiverId:string,
  profileUrl: string;
  refreshToken: String;
  tokenExpiresIn: Date | null;
  unreadCount: unreadCountType;
  publickey:string
}

export type incomingCallType = {
  callerId: string;
  callStatus: string;
  callerName: string;
  callerProfileUrl: string;
};



export  interface CredentialResType {
  [Key: string]: string;
}
 

export type keyPair ={
  publicKey:string,
  privateKey:string,
} 

export interface WebSocketContextType {
  ws: React.MutableRefObject<WebSocket | null>;
  connected: boolean;
  setConnected: React.Dispatch<React.SetStateAction<boolean>>;
  connectionBooleanRef: React.MutableRefObject<boolean>;
  onlineUsers: string[];
}

export interface UserTypes {
  id: string;
  name: string;
  email: string;
  isLogin: boolean;
  profileUrl: string | undefined;
}

export interface AddMoreMembersPropsType {
  userId:string,
  selectedGroup:SelectedGroupType
} 


export interface AichatBotProps {
  selectedUser: selectedChatType | null;
  onSelectUser: React.Dispatch<SetStateAction<selectedChatType | null>>;
  setOpenContextMenu: (state: null) => void;
  setChatId: (state: string) => void;
} 


export  interface VideoCallDialogProps {
   callerId: string | undefined;
   setCallAccepted: React.Dispatch<React.SetStateAction<boolean>>;
   isCallAccepted: boolean;
 }
 
export  type LocalVideoSizeTypes = {
   width: number;
   height: number;
 }; 



export  interface GroupChatWindowPropsType {
  ws:WebSocket | null,
  senderId:string,
  selectedGroup:SelectedGroupType,
  setSelectedGroup:React.Dispatch<React.SetStateAction<SelectedGroupType | null >>
  logedInUser:UserType
}


export interface GroupMessageType {
  id?:string
  content:string,
  senderId:string,
  groupId:string,
  isMedia?:boolean,
}

 
 
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


export type onlineUsersType = string
export interface UserListProps {
  selectedUser: selectedChatType | null; 
  onSelectUser: React.Dispatch<React.SetStateAction<selectedChatType | null>>; 
  onlineUsers: onlineUsersType[];
  logedInUser:UserType
}
 
export interface UserListProps {
  selectedUser: selectedChatType | null;
  onSelectUser: React.Dispatch<SetStateAction<selectedChatType | null>>;
  connected: boolean;
  onlineUsers: string[];
  ws: WebSocket | null;
  logedInUser: UserType;
  setChatId: (state: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  isConnected:boolean
}


