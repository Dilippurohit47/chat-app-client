import React, { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../context/webSocket";
import { FaVideoSlash } from "react-icons/fa";
import { FaVideo } from "react-icons/fa";
import { Loader, LoaderCircle } from "lucide-react";
import { FaMicrophone } from "react-icons/fa";
import { FaMicrophoneSlash } from "react-icons/fa";
import { IoMdResize } from "react-icons/io";

interface VideoCallDialogProps {
  setCall: React.Dispatch<React.SetStateAction<string | null>>;
  setIsCallOpen: React.Dispatch<React.SetStateAction<boolean>>;
  call: string | null;
  selectedUserId: string;
}

type LocalVideoSizeTypes = {
  width:number,
  height:number,
}
const VideoCallDialog = ({
  setCall,
  call,
  setIsCallOpen,
  selectedUserId,
}: VideoCallDialogProps) => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const { ws } = useWebSocket();
const [camera,setCamera] = useState(true)
const [mic,setMic]  =useState(true)
const [remoteUserCamera,setRemoteUserCamera] = useState(true)
const [remoteUserAudio,setRemoteUserAudio] = useState(true)
  const [stream,setStream] = useState<MediaStream |null>(null)
  const  [localVideoSize,setLocalVideoSize] = useState<LocalVideoSizeTypes>({ height:200,  width:240})
  
  useEffect(() => {
 
    let messageHandler: ((m: MessageEvent) => void) | null = null;

    const startVideo = async () => {
      if (!call) return;

      try {
        let localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
setStream(localStream)
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
          
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        };

   // Handle ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            console.log("Sending ICE candidate from sender");
            ws.current?.send(JSON.stringify({
      type: "ice-candidate",
      candidate: {
        candidate: event.candidate.candidate,
        sdpMid: event.candidate.sdpMid,
        sdpMLineIndex: event.candidate.sdpMLineIndex,
      },
      receiverId: selectedUserId,
    }));
  }
};

        // Handle connection state changes
   

        // Handle incoming messages
        messageHandler = async (m: MessageEvent) => {
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
          if(data.type === 'audio-video-toggle'){
            setRemoteUserCamera((prev) =>prev === data.video ? prev : data.video)
            setRemoteUserAudio((prev) =>prev === data.audio ? prev : data.audio)
          }
        };

        ws.current?.addEventListener("message", messageHandler);

        // Create and send offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        ws.current?.send(
          JSON.stringify({
            type: "offer",
            receiverId: selectedUserId,
            offer,
          })
        );
        console.log("Offer sent");

      } catch (error) {
        console.error("Error starting call:", error);
      }
    };

    startVideo();

    return () => {
      if (messageHandler) {
        ws.current?.removeEventListener("message", messageHandler);
      }
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    };
  }, [call, selectedUserId, ws]);

  useEffect(() =>{
if(localVideoRef.current && stream){
  localVideoRef.current.srcObject = stream
}
  },[stream])


  const hangUp = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localVideoRef.current) {
      const stream = localVideoRef.current.srcObject as MediaStream | null;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      localVideoRef.current.srcObject = null;
    }
    setCall(null);
    setIsCallOpen(false);
  };

useEffect(() =>{
  if(!ws.current) return
ws.current?.send(JSON.stringify({
  receiverId:selectedUserId,
  video:camera,
  audio:mic,
  type:'audio-vedio-toggle'
}))
},[camera,mic]) 
  if (!call) return null;
  const toggleVideo  =() =>{
stream?.getVideoTracks().forEach((track) =>track.enabled = !track.enabled)
setCamera((prev) =>!prev)
  }
  const toggleAudio = () =>{
stream?.getAudioTracks().forEach((track) =>track.enabled = !track.enabled)
setMic((prev) =>!prev)
  }
  console.log("remote user trakcs",remoteUserAudio ,remoteUserCamera)
   const localVideoResize = (e) =>{
    const startX = e.clientX
    const startY = e.clientY
    const startHeight = localVideoSize.height
    const startWidth = localVideoSize.width

    

    const mouseMove =(mouseEvent)=>{
      const newWidth = startWidth + (startX - mouseEvent.clientX)
      const newHeight = startHeight + (startY - mouseEvent.clientY)
      setLocalVideoSize({height:newHeight,width:newWidth})

    }
const mouseUp =() =>{
  window.removeEventListener("mousemove",mouseMove)
  window.removeEventListener("mouseup",mouseUp)
}
    window.addEventListener("mousemove",mouseMove)
    window.addEventListener("mouseup",mouseUp)
  }
  return (
       <div className="absolute overflow-hidden bg-black top-16 h-[80%] w-[97%]">
         <div className="flex flex-col   justify-between items-center">
            
            <div className={`absolute overflow-hidden    rounded-md  right-0 bottom-2 `}
            style={{
             height:`${localVideoSize.height}px`,
             width:`${localVideoSize.width}px`
            }}>
        <video
               ref={localVideoRef}
               autoPlay
               playsInline
               muted
               className={`w-[100%] h-[100%] object-cover  ${camera ? "block" : "hidden"}`}
             /> 
             <div className="rounded-full z-50 px-2 py-2 absolute top-2 left-2 bg-black text-white  cursor-pointer " onMouseDown={localVideoResize}>
               <IoMdResize  size={16} />
             </div>
            </div>
     
     {!camera && (
       <div className=" rounded-md absolute right-0 bottom-2 bg-purple-500 h-[50%]" style={{
         height:`${localVideoSize.height}px`,
         width:`${localVideoSize.width}px`
       }}
        />
       
     )}
     
     {!remoteUserCamera 
     && <div className=" w-[80%] bg-pink-500 h-[80vh]">
       </div>
     }
     <video 
               ref={remoteVideoRef}
               autoPlay
               playsInline
               className={`w-[80%] ${remoteUserCamera ? "block" :"hidden"}`}
               muted
             />    
           </div>
     
<div className="absolute  gap-3 flex justify-center items-center z-50 top-[90%] left-[40%] ">
 
    <div className="text-white cursor-pointer"  onClick={toggleAudio}>
        {
          mic ? <FaMicrophone  size={35}/> : <FaMicrophoneSlash  size={35}/>
        }
      </div>

        <button
        className="bg-red-500  rounded-md  text-white px-4 py-2 "
        onClick={hangUp}
      >
        Hang up
      </button>
      <div className="text-white  cursor-pointer " onClick={toggleVideo}>
        {
          camera ? <FaVideo  size={35}/> : <FaVideoSlash  size={35}/>
        }
      </div>
</div>
    </div>
  );
};

export default VideoCallDialog;