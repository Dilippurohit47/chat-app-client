import React, { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../../../context/webSocket";
import { FaVideoSlash } from "react-icons/fa";
import { FaVideo } from "react-icons/fa";
import { FaMicrophone } from "react-icons/fa";
import { FaMicrophoneSlash } from "react-icons/fa";
import { IoMdResize } from "react-icons/io";
import { LocalVideoSizeTypes, VideoCallDialogProps } from "../types";
import { useCallMedia } from "../hooks/useCallMedia";
import { useStartCall } from "../hooks/useStartCall";

const StartVideoCall = ({
  setCall,
  call,
  setIsCallOpen,
  selectedUserId,
  logedInUser,
}: VideoCallDialogProps) => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const { ws } = useWebSocket();

  // const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCallAccepted, setIsCallAccepted] = useState<boolean>(false);


  const { localStream ,hangUp ,remoteUserAudio ,remoteVideoStream,remoteUserCamera} = useStartCall({receiverId:selectedUserId,call,isCallAccepted,sender:logedInUser,ws , setCall  ,setIsCallOpen})
  const  {toggleAudio , toggleVideo ,localVideoResize ,localVideoSize  ,isCameraOn:camera , isMicOn:mic} = useCallMedia(localStream)

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(()=>{
    if (remoteVideoRef.current && remoteVideoStream) {
      remoteVideoRef.current.srcObject = remoteVideoStream;
    }
  },[])

  useEffect(() => {
    const handleMessage = (m: MessageEvent) => {
      const data = JSON.parse(m.data);
      if (data.type === "client-call-status") {
        if (data.callStatus === "accepted") {
          console.log("call accepted through ws");
          setIsCallAccepted(true);
        }
        if(data.callStatus === "hang-up"){
          hangUp()
        }
      }
    };
    ws.current?.addEventListener("message", handleMessage);
    return () => {
      ws.current?.removeEventListener("message", handleMessage);
    };
  }, []);



  useEffect(() => {
    if (!ws.current) return;
    ws.current?.send(
      JSON.stringify({
        receiverId: selectedUserId,
        video: camera,
        audio: mic,
        type: "audio-vedio-toggle",
      })
    );
  }, [camera, mic]);



  if (!call) return null;


  return (
    <div className="absolute overflow-hidden bg-black top-16 h-[80%] w-[97%]">
      <div className="flex flex-col   justify-between items-center">
        <div
          className={`absolute overflow-hidden    rounded-md  right-0 bottom-2 `}
          style={{
            height: `${localVideoSize.height}px`,
            width: `${localVideoSize.width}px`,
          }}
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-[100%] h-[100%] object-cover  ${
              camera ? "block" : "hidden"
            }`}
          />
          <div
            className="rounded-full z-50 px-2 py-2 absolute top-2 left-2 bg-black text-white  cursor-move "
            onMouseDown={localVideoResize}
          >
            <IoMdResize size={16} />
          </div>
        </div>

        {!camera && (
          <div
            className=" rounded-md absolute right-0 bottom-2 bg-purple-500 h-[50%]"
            style={{
              height: `${localVideoSize.height}px`,
              width: `${localVideoSize.width}px`,
            }}
          />
        )}

        {!remoteUserCamera && (
          <div className=" w-[80%] bg-pink-500 h-[80vh]"></div>
        )}
{
  isCallAccepted ?         <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`w-[80%] ${remoteUserCamera ? "block" : "hidden"}`}
        /> : <div className={`w-[80%] text-2xl font-semibold h-[70vh] flex justify-center items-center text-white text-center ${remoteUserCamera ? "block" : "hidden"}`}> 
        Calling...
        </div>
}
      </div>

      <div className="absolute  gap-3 flex justify-center items-center z-50 top-[90%] left-[40%] ">
        <div className="text-white cursor-pointer" onClick={toggleAudio}>
          {mic ? <FaMicrophone size={35} /> : <FaMicrophoneSlash size={35} />}
        </div>

        <button
          className="bg-red-500  rounded-md  text-white px-4 py-2 "
          onClick={hangUp}
        >
          Hang up
        </button>
        <div className="text-white  cursor-pointer " onClick={toggleVideo}>
          {camera ? <FaVideo size={35} /> : <FaVideoSlash size={35} />}
        </div>
      </div>
    </div>
  );
};

export default StartVideoCall;
