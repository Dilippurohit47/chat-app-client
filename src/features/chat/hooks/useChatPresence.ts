import { useEffect } from "react";

export const useChatPresence = (ws: WebSocket | null, chatId: string | null ) => {
  useEffect(() => {
    if (!ws || !chatId) return;
    ws.send(
      JSON.stringify({
        type: "active-chat:set",
        chatId
      })
    );

    return () => {
      ws.send(
        JSON.stringify({
          type: "active-chat:clear",
          chatId
        })
      );
    };

  }, [ws, chatId]);
};