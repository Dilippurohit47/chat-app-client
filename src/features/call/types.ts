import { UserType } from "../../slices/userSlice";

export type incomingCallType = {
  callerId: string;
  callStatus: string;
  callerName: string;
  callerProfileUrl: string;
};

export  interface VideoCallDialogProps {
   callerId: string | undefined;
   setCallAccepted: React.Dispatch<React.SetStateAction<boolean>>;
   isCallAccepted: boolean;
 }
 
export  type LocalVideoSizeTypes = {
   width: number;
   height: number;
 }; 

 export interface VideoCallDialogProps {
  setCall: React.Dispatch<React.SetStateAction<string | null>>;
  setIsCallOpen: React.Dispatch<React.SetStateAction<boolean>>;
  call: string | null;
  selectedUserId: string;
  logedInUser: UserType;
}
