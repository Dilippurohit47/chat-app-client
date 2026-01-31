import { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { SearchBarProps } from "../types";

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
      className={`w-[25rem] rounded-sm  h-12 mt-1 bg-[#3F3D56] flex justify-start px-2 items-center gap-1 absolute transition-all ease-in-out duration-200 ${
        isOpen ? "  transform -translate-x-[50%] right-[100%] -translate-y-[50%] sm:left-[-400%] sm:top-[10%]   md:left-[-500%] md:top-[10%] mt-[3.5rem]   opacity-1" : "  opacity-0 -top-5 right-[3rem]  pointer-events-none hidden"
      }`}
    >
      <div className="w-[100%]"> 
        <input
          type="text"
          className="h-8 h w-[100%]  bg-white px-2 focus:outline-0 rounded"
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
        className="text-white w-[10%] rotate-[180deg] cursor-pointer"
        onClick={scrollToFindMessageForward}
      >
        <IoIosArrowDown size={22} />
      </div>
      <div
        className="text-white w-[10%] cursor-pointer"
        onClick={scrollToFindMessageBackward}
      >
        <IoIosArrowDown size={22} />
      </div>
      <div className="  text-white  w-[20%]">{ messageIndex  !== null ?  messageIndex  + 1 : 1 } of {totalFindmessages}</div>
    </div>
  );
};

export default SearchBarForChat;
