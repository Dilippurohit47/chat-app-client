import { RefObject, SetStateAction, useEffect, useRef, useState } from "react";
import { UserType } from "../../../slices/userSlice";

type useStartCallProps ={
isCallAccepted:boolean
ws:RefObject<WebSocket | null>
receiverId:string,
sender:UserType,
call:string | null
  setCall: React.Dispatch<SetStateAction<string | null>>;
  setIsCallOpen: React.Dispatch<SetStateAction<boolean>>;
}

export const useStartCall = ({isCallAccepted ,ws ,receiverId ,sender,call ,setCall , setIsCallOpen}:useStartCallProps)=>{

  const pcRef = useRef<RTCPeerConnection | null>(null);

    const  [remoteVideoStream,setRemoteVideoStream] = useState<MediaStream | null>(null)
  const [remoteUserCamera, setRemoteUserCamera] = useState(true);
  const [remoteUserAudio, setRemoteUserAudio] = useState(true);
    const [localStream ,setLocalStream] = useState<MediaStream | null>(null)

const localStreamRef = useRef<MediaStream | null>(null);

useEffect(() => {
  if (!ws.current) return;
  if (!call) return;

  const startVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localStreamRef.current = stream;
    setLocalStream(stream);
  };

  ws.current.send(
    JSON.stringify({
      type: "someone-is-calling",
      callReceiverId: receiverId,
      callerData: {
        callerId: sender.id,
        callerName: sender.name,
        callerProfileUrl: sender.profileUrl,
      },
    })
  );

  startVideo();

  return () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    pcRef.current?.close();
    pcRef.current = null;
  };
}, [call]);


      useEffect(() => {
        if (!isCallAccepted) return;
        const startSignaling = async () => {
          try {
            if (!localStream) return;
            // Create PeerConnection
            const pc = new RTCPeerConnection({
              iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
            });
            pcRef.current = pc;
            // Add local tracks
            localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
            // Listen for remote stream
            pc.ontrack = (event) => {
              const [remoteStream] = event.streams;
               setRemoteVideoStream ( remoteStream);
            };
    
            // Handle ICE candidates
            pc.onicecandidate = (event) => {
              if (event.candidate) {
         ws.current?.send(
                  JSON.stringify({
                    type: "ice-candidate",
                    candidate: event.candidate,
                    receiverId: receiverId,
                  })
                );
              }
            };
    
            // Handle incoming messages
            const messageHandler = async (m: MessageEvent) => {
              const data = JSON.parse(m.data);
    
              if (data.type === "answer") {
                if (pc.signalingState === "have-local-offer") {
                  await pc.setRemoteDescription(data.answer);
                } else {
                  console.warn("Ignoring answer, wrong state:", pc.signalingState);
                }
              } else if (data.type === "ice-candidate") {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (error) {
                  console.error("Error adding ICE candidate:", error);
                }
              }
              if (data.type === "audio-video-toggle") {
                setRemoteUserCamera((prev) =>
                  prev === data.video ? prev : data.video
                );
                setRemoteUserAudio((prev) =>
                  prev === data.audio ? prev : data.audio
                );
              }
            };
    
            ws.current?.addEventListener("message", messageHandler);
    
            // Create and send offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
    
            ws.current?.send(
              JSON.stringify({
                type: "offer",
                receiverId: receiverId,
                offer,
              })
            );
            console.log("Offer sent");
          } catch (error) {
            console.log("error in signaling rtc ", error);
          }
        };
        startSignaling();
      }, [isCallAccepted]);


      
  const hangUp = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
if (localStream) {
  localStream.getTracks().forEach((track) => track.stop());
}
setLocalStream(null);
    ws.current?.send(
      JSON.stringify({
        type: "call-status",
        callStatus: "hang-up",
        callReceiverId: receiverId,
      })
    );
    setCall(null);
    setIsCallOpen(false);
  };



    return{
        remoteUserCamera ,
        remoteVideoStream , 
        localStream,
        remoteUserAudio,
        hangUp
    }
}