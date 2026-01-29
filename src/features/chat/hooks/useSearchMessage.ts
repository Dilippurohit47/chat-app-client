import { RefObject, useRef, useState } from "react";
import { MessageType } from "../types"

type useSearchMessagesProps = {
    messages:MessageType[]
    chatWindowRef:RefObject<HTMLDivElement  | null >
}

export const useSearchMessages = ({messages , chatWindowRef}:useSearchMessagesProps)=>{
  const [findMessagesIds, setFindMessagesIds] = useState<string[]>([]);
  const [messageIndex, setMessageIndex] = useState<number | null>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});



    const setRefs = (
      el: HTMLDivElement | null,
      messageId: string,
      isLast: boolean
    ) => {
      if (el) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        messageRefs.current[messageId] = el;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (isLast) chatWindowRef.current = el;
      }
    };
const findMessages = (text: string) => {
  const allMessageIds = Object.keys(messageRefs.current);

  // 1️⃣ Clear all previous highlights
  allMessageIds.forEach((id) => {
    const outer = messageRefs.current[id];
    if (!outer) return;

    const bubble = outer.querySelector(".message-bubble");
    bubble?.classList.remove("bg-yellow-400/100");
  });

  // 2️⃣ Empty search → reset EVERYTHING
  if (!text.trim()) {
    setFindMessagesIds([]);
    setMessageIndex(null); // ✅ IMPORTANT
    return;
  }

  // 3️⃣ Find matching messages
  const findMessageIds = allMessageIds.filter((id) =>
    messageRefs.current[id]?.textContent
      ?.toLowerCase()
      .includes(text.toLowerCase())
  );

  // 4️⃣ Highlight matches
  findMessageIds.forEach((messageId) => {
    const outer = messageRefs.current[messageId];
    if (!outer) return;

    const bubble = outer.querySelector(".message-bubble");
    bubble?.classList.add("bg-yellow-400/100");
  });

  // 5️⃣ Sync index with results
  setFindMessagesIds(findMessageIds);
  setMessageIndex(findMessageIds.length ? 0 : null); // ✅ IMPORTANT
};


 const clickToFindMessageForward = () => {
  if (findMessagesIds.length === 0) return;

  setMessageIndex((prevIndex) => {
    let newIndex;

    if (prevIndex === null) {
      newIndex = findMessagesIds.length - 1; // start from last
    } else {
      newIndex = Math.max(prevIndex - 1, 0);
    }

    const messageId = findMessagesIds[newIndex];
    messageRefs.current[messageId]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    return newIndex;
  });
};

const clickToFindMessageBackward = () => {
  if (findMessagesIds.length === 0) return;

  setMessageIndex((prevIndex) => {
    let newIndex;

    if (prevIndex === null) {
      newIndex = 0; // start from first
    } else {
      newIndex = Math.min(prevIndex + 1, findMessagesIds.length - 1);
    }

    const messageId = findMessagesIds[newIndex];
    messageRefs.current[messageId]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    return newIndex;
  });
};




  return {
messageIndex,
messageRefs,
findMessagesIds,
setFindMessagesIds,
setRefs,
findMessages,
clickToFindMessageForward,
clickToFindMessageBackward,
}

}