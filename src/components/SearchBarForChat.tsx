import { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { MessageType } from "../components/ChatWindow";

interface SearchBarProps {
  isOpen: boolean;
  findMessages: (state:string) => void;
  scrollToFindMessageForward: () => void;  
  scrollToFindMessageBackward: () => void; 
  messageIndex: null | number; 
  totalFindmessages: number; 
  messages:MessageType[]
}

const SearchBarForChat = ({
  isOpen,
  findMessages,
  scrollToFindMessageForward,
  scrollToFindMessageBackward,
  messageIndex, 
  totalFindmessages
}:SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && isOpen) {
      inputRef?.current?.focus();
    }
  },[isOpen]);
  const [searchInput, setSearchInput] = useState("");
  return (
    <div
      className={`w-[20rem] rounded-sm h-12 mt-1 bg-[#3F3D56] flex justify-start px-2 items-center gap-1 absolute transition-all ease-in-out duration-200 ${
        isOpen ? "  transform -translate-x-[50%] -translate-y-[50%] sm:left-[67%] sm:top-[10%] top-[12%] right-[-10%]  opacity-1" : "  opacity-0 -top-5 right-[3rem]  pointer-events-none hidden"
      }`}
    >
      <div>
        <input
          type="text"
          className="h-8 h w-[12rem] bg-white px-2 focus:outline-0 rounded"
          placeholder="search in chat"
          onChange={(e) =>{
            setSearchInput(e.target.value);
            findMessages(e.target.value);
          }}
          ref={inputRef}
          value={searchInput}
        />
      </div>
      <div
        className="text-white rotate-[180deg] cursor-pointer"
        onClick={scrollToFindMessageForward}
      >
        <IoIosArrowDown size={22} />
      </div>
      <div
        className="text-white cursor-pointer"
        onClick={scrollToFindMessageBackward}
      >
        <IoIosArrowDown size={22} />
      </div>
      <div className="  text-white  w-full">{ messageIndex && messageIndex +1} of {totalFindmessages}</div>
    </div>
  );
};

export default SearchBarForChat;
