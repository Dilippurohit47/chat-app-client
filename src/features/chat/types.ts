import { SetStateAction } from "react";
import { UserType } from "../../slices/userSlice";





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




export interface AichatBotProps {
  selectedUser: selectedChatType | null;
  onSelectUser: React.Dispatch<SetStateAction<selectedChatType | null>>;
  setOpenContextMenu: (state: null) => void;
  setChatId: (state: string) => void;
} 



 export type MessageStatus   = "pending"|"sent" | "delivered" | "seen"
 export type MessageType = {
  id?: string;
  senderId: string;
  receiverId: string;
  senderContent:string,
  receiverContent:string,
  createdAt: number;
  tempId: string;
  isMedia?: boolean;
  uploading?: boolean;
  chatId: string | null;
  status:MessageStatus;
  error:boolean;
  errorMessage:string | null;
};
 




 export interface SearchBarProps {
  isOpen: boolean;
  findMessages: (state:string) => void;
  scrollToFindMessageForward: () => void;  
  scrollToFindMessageBackward: () => void; 
  messageIndex: null | number; 
  totalFindmessages: number; 
  messages:MessageType[]
}

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

