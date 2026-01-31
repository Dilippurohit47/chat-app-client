import React, {  useEffect, useRef } from "react";
import { useWebSocket } from "../../../context/webSocket";
import { FaVideoSlash } from "react-icons/fa";
import { FaVideo } from "react-icons/fa";
import { IoMdResize } from "react-icons/io";
import { FaMicrophone } from "react-icons/fa";
import { FaMicrophoneSlash } from "react-icons/fa";
import { forwardRef ,useImperativeHandle } from "react";
import {  VideoCallDialogProps } from "../types";
import { useCallSignaling } from "../hooks/useCallSignaling";
import { useCallMedia } from "../hooks/useCallMedia";

const AnswerVideoCall = forwardRef((props: VideoCallDialogProps, ref)=> {
    const { callerId, setCallAccepted, isCallAccepted } = props;
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const { ws } = useWebSocket();
      const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const {
  localStream,
  remoteStream,
  remoteUserCamera,
  hangUp
} = useCallSignaling({ ws, callerId ,setCallAccepted  });

  if (!callerId) return null;
const {toggleVideo ,toggleAudio , isCameraOn:camera , isMicOn:mic , localVideoResize , localVideoSize} = useCallMedia(localStream)
useEffect(() => {
  if (!remoteVideoRef.current) return;
  remoteVideoRef.current.srcObject = remoteStream;
}, [remoteStream]);



useEffect(() => {
  if (!localVideoRef.current) return;
  localVideoRef.current.srcObject = localStream;
}, [localStream]);



useImperativeHandle(ref, () => ({
  hangUp, 
}));

  useEffect(() => {
      if (!ws.current) return;
      ws.current?.send(
        JSON.stringify({
          receiverId: callerId,
          video: camera,
          audio: mic,
          type: "audio-vedio-toggle",
        })
      );
    }, [camera, mic]);

  return (
    <div
      className="absolute overflow-hidden bg-black top-16 h-[80%] w-[97%]"
      style={{ display: `${isCallAccepted ? "block" : "none"}` }}
    >
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
            className="rounded-full z-50 px-2 py-2 absolute top-2 left-2 bg-black text-white  cursor-pointer "
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
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`w-[80%] ${remoteUserCamera ? "block" : "hidden"}`}
          muted
        />
      </div>

      <div
        className={`absolute  gap-3 flex justify-center items-center z-50 top-[90%] left-[40%]  `}
      >
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
});

export default AnswerVideoCall;
