import { useEffect, useState } from "react";
import { LocalVideoSizeTypes } from "../types";

export const useCallMedia = (localStream: MediaStream | null ) => {
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
    const [localVideoSize, setLocalVideoSize] = useState<LocalVideoSizeTypes>({
    height: 200,
    width: 240,
  });

  const toggleVideo = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    const enabledNow = localStream.getVideoTracks().some((t) => t.enabled);
    setIsCameraOn(enabledNow);
  };

  const toggleAudio = () => {
    if (!localStream) return;

    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    const enabledNow = localStream.getAudioTracks().some((t) => t.enabled);
    setIsMicOn(enabledNow);
  };

  useEffect(() => {
    if (!localStream) return;

    setIsCameraOn(localStream.getVideoTracks().some((t) => t.enabled));
    setIsMicOn(localStream.getAudioTracks().some((t) => t.enabled));
  }, [localStream]);


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


  return { isCameraOn, isMicOn, toggleVideo, toggleAudio , localVideoResize , localVideoSize };
};
