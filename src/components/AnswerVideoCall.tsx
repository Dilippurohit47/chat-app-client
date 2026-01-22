import React, { MouseEventHandler, useEffect, useRef, useState } from "react";
import { useWebSocket } from "../context/webSocket";
import { FaVideoSlash } from "react-icons/fa";
import { FaVideo } from "react-icons/fa";
import { IoMdResize } from "react-icons/io";
import { FaMicrophone } from "react-icons/fa";
import { FaMicrophoneSlash } from "react-icons/fa";
import { forwardRef ,useImperativeHandle } from "react";
import { LocalVideoSizeTypes, VideoCallDialogProps } from "../types";

const AnswerVideoCall = forwardRef((props: VideoCallDialogProps, ref)=> {

  

    const { callerId, setCallAccepted, isCallAccepted } = props;

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const [remoteStream, setRemoteStream] = useState(false);
  const [camera, setCamera] = useState(true);
  const [mic, setMic] = useState(true);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const { ws } = useWebSocket();
  const [stream, setStream] = useState<MediaStream | null>(null);

  const [remoteUserCamera, setRemoteUserCamera] = useState(true);
  const [remoteUserAudio, setRemoteUserAudio] = useState(true);
  const [localVideoSize, setLocalVideoSize] = useState<LocalVideoSizeTypes>({
    height: 200,
    width: 240,
  });

  useEffect(() => {}, []);

  useEffect(() => {
    const startVideo = async () => {
      if (!callerId) return;
      try {
        let localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        pcRef.current = pc;
        setStream(localStream);
        // add tracks
        localStream
          ?.getTracks()
          .forEach((track) => pc.addTrack(track, localStream));

        ws.current?.send(
          JSON.stringify({
            type: "call-status",
            callStatus: "accepted",
            receiverId: callerId,
          })
        );
        // remote track
        pc.ontrack = (event) => {
          const [remoteStream] = event.streams;
          if (
            remoteVideoRef.current &&
            remoteVideoRef.current.srcObject !== remoteStream
          ) {
            try {
              remoteVideoRef.current.srcObject = remoteStream;
            } catch (err) {
              console.log("error in putting", err);
            }
          }
        };

        // send ICE
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            ws.current?.send(
              JSON.stringify({
                type: "ice-candidate",
                candidate: event.candidate,
                receiverId: callerId,
              })
            );
          }
        };

        // handle incoming signaling
        const handleMessage = async (m: MessageEvent) => {
          const data = JSON.parse(m.data);
          if (data.type === "offer") {
            await pc.setRemoteDescription(data.offer);

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            ws.current?.send(
              JSON.stringify({
                type: "answer",
                answer,
                receiverId: callerId,
              })
            );
          } else if (data.type === "ice-candidate") {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (err) {
              console.warn("Failed to add ICE candidate:", err);
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

        ws.current?.addEventListener("message", handleMessage);

        return () => {
          ws.current?.removeEventListener("message", handleMessage);
          //   pc.close();
        };
      } catch (error) {
        console.log("Error in getUserMedia", error);
      }
    };

    startVideo();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    };
  }, [callerId]);

  const hangUp = () => {
    if (localVideoRef.current) {
      const stream = localVideoRef.current.srcObject as MediaStream | null;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      localVideoRef.current.srcObject = null;
    }
    pcRef.current?.close();
    setCallAccepted(false);

        ws.current?.send(
      JSON.stringify({
        type: "call-status",
        callStatus: "hang-up",
        callReceiverId: callerId,
      })
    );
    
  };
useImperativeHandle(ref, () => ({
  hangUp, 
}));
  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  const toggleVideo = () => {
    stream
      ?.getVideoTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    setCamera((prev) => !prev);
  };
  const toggleAudio = () => {
    stream
      ?.getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    setMic((prev) => !prev);
  };

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
  if (!callerId) return null;

  const localVideoResize = (e:React.MouseEvent<HTMLDivElement>) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const startHeight = localVideoSize.height;
    const startWidth = localVideoSize.width;

    const mouseMove = (mouseEvent:MouseEvent) => {
      const newWidth = startWidth + (startX - mouseEvent.clientX);
      const newHeight = startHeight + (startY - mouseEvent.clientY);
      setLocalVideoSize({ height: newHeight, width: newWidth });
    };
    const mouseUp = () => {
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseup", mouseUp);
    };
    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseup", mouseUp);
  };

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
