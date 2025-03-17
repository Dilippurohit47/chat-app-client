import { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
const SearchBarForChat = ({
  isOpen,
  findMessages,
  scrollToFindMessageForward,
  scrollToFindMessageBackward,
  messageIndex, 
  totalFindmessages
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current && isOpen) {
      inputRef?.current?.focus();
    }
  });
  const [searchInput, setSearchInput] = useState("");
  return (
    <div
      className={`w-[20rem] rounded-sm h-12 mt-1 bg-[#3F3D56] flex justify-start px-2 items-center gap-1 absolute transition-all ease-in-out duration-200 ${
        isOpen ? " top-15 right-[3rem]" : " opacity-1 -top-5 right-[3rem]"
      }`}
    >
      <div>
        <input
          type="text"
          className="h-8 h w-[12rem] bg-white px-2 focus:outline-0 rounded"
          placeholder="search withi chat"
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
      <div className="  text-white  w-full">{messageIndex +1} of {totalFindmessages}</div>
    </div>
  );
};

export default SearchBarForChat;
