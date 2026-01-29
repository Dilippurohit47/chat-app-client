import React, { RefObject, SetStateAction, useEffect, useRef, useState } from "react";

type UseCallSignalingProps = {
  callerId: string | undefined;
  ws: RefObject<WebSocket | null>;
  setCallAccepted:React.Dispatch<SetStateAction<boolean>>
};

export const useCallSignaling = ({ ws, callerId ,setCallAccepted }: UseCallSignalingProps) => {
  const pcRef = useRef<RTCPeerConnection | null>(null);



  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const [remoteUserCamera, setRemoteUserCamera] = useState(true);
  const [remoteUserAudio, setRemoteUserAudio] = useState(true);

  


  useEffect(() => {
    if (!callerId || !ws.current) return;

    let mounted = true;

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

      if (!mounted) {
        stream.getTracks().forEach((t) => t.stop());
        return;
          }

        setLocalStream(stream);

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        pcRef.current = pc;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        ws.current?.send(
          JSON.stringify({
            type: "call-status",
            callStatus: "accepted",
            receiverId: callerId,
          })
        );

        pc.ontrack = (event) => {
          const [stream] = event.streams;
          console.log("stream",stream ,event)
          setRemoteStream(stream); 
        };

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
          }

          if (data.type === "ice-candidate") {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (err) {
              console.warn("Failed to add ICE candidate:", err);
            }
          }

          if (data.type === "audio-video-toggle") {
            setRemoteUserCamera(data.video);
            setRemoteUserAudio(data.audio);
          }
        };

        ws.current?.addEventListener("message", handleMessage);

        return () => {
          ws.current?.removeEventListener("message", handleMessage);
        };
      } catch (err) {
        console.log("Error in getUserMedia", err);
      }
    };

    let cleanupWs: void | (() => void);

    startVideo().then((c) => {
      cleanupWs = c;
    });

    return () => {
      mounted = false;
      cleanupWs?.();
      pcRef.current?.close();
      pcRef.current = null;
      localStream?.getTracks().forEach((t) => t.stop());
      setLocalStream(null);
      setRemoteStream(null);
    };
  }, [callerId, ws]);



    const hangUp = () => {
      if (localStream) {
          localStream?.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
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

  return {
    localStream,
    remoteStream,
    remoteUserCamera,
    remoteUserAudio,
    hangUp
  };
};
