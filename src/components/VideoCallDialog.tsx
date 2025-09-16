import React, { useEffect, useRef } from "react";
import { useWebSocket } from "../context/webSocket";

interface VideoCallDialogProps {
  setCall: React.Dispatch<React.SetStateAction<string | null>>;
  setIsCallOpen: React.Dispatch<React.SetStateAction<boolean>>;
  call: string | null;
  selectedUserId: string;
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
  useEffect(() => {
    let stream: MediaStream;

    const startVideo = async () => {
      if (!call) return;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.log("error in getting user media", error);
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
  }, [call]);

  const hangUp = () => {
    if (localVideoRef.current) {
      let stream = localVideoRef.current.srcObject as MediaStream | null;
      if (!stream) return;

      stream.getTracks().forEach((track) => {
        track.stop();
        stream.removeTrack(track);
      });
    }
    setCall(null);
    setIsCallOpen(false);
  };

useEffect(() => {
  if (!ws.current) return;

  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });
  pcRef.current = pc;

  // 2️⃣ Function to setup tracks and ICE handlers
  const setupPC = (pc: RTCPeerConnection, stream: MediaStream) => {
    // Add local tracks
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    // Listen for remote tracks
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        ws.current?.send(
          JSON.stringify({
            type: "ice-candidate",
            candidate: event.candidate,
            receiverId: selectedUserId,
          })
        );
      }
    };
  };

  // 3️⃣ Setup local media
 let stream = localVideoRef?.current.srcObject 
    setupPC(pc, stream);

  // 4️⃣ Handle incoming signaling messages
  const handleMessage = async (m: MessageEvent) => {
    const data = JSON.parse(m.data);
    console.log("WebRTC message received:", data);

    // Incoming offer (someone is calling us)
    if (data.type === "offer") {
      if (!pcRef.current) {
        pcRef.current = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        // Setup local tracks again
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
        setupPC(pcRef.current, localStream);
      }

      await pcRef.current.setRemoteDescription(data.offer);

      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);

      ws.current?.send(
        JSON.stringify({
          type: "answer",
          answer,
          receiverId: data.from, // send back to caller
        })
      );
    }

    // Incoming answer (we called someone and they accepted)
    else if (data.type === "answer") {
      await pcRef.current?.setRemoteDescription(data.answer);
    }

    // ICE candidates
    else if (data.type === "ice-candidate") {
      await pcRef.current?.addIceCandidate(data.candidate);
    }
  };

  ws.current.addEventListener("message", handleMessage);

  // 5️⃣ If we are the caller, create offer
  const callUser = async () => {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    ws.current?.send(
      JSON.stringify({
        type: "offer",
        receiverId: selectedUserId,
        offer,
      })
    );
  };

  callUser().catch((err) => console.error("Call setup failed:", err));

  // 6️⃣ Cleanup
  return () => {
    ws.current?.removeEventListener("message", handleMessage);
    pc.close();
  };
}, []);

  if (!call) {
    return;
  }
  return (
    <div className="absolute bg-black  top-16 h-[80%] w-[97%]">
      <div className="outgoing-vedio">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="h-[50%] w-[100%]"
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          muted
          className="h-[50%] w-[100%]"
        />
      </div>

      <button
        className="bg-red-500 top-[95%] left-1/2 rounded-md   transform -translate-x-1/2 -translate-y-1/2 text-white px-4 py-2 absolute z-50"
        onClick={hangUp}
      >
        Hang up
      </button>
    </div>
  );
};

export default VideoCallDialog;
