import { useEffect, useState } from "react";

export const useIsMobile = ()=>{

  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    const handleScreenSize = () => {
      setIsMobile(window.innerWidth < 521);
    };

    handleScreenSize();

    window.addEventListener("resize", handleScreenSize);

    return () => {
      window.removeEventListener("resize", handleScreenSize);
    };
  }, []);


    return {
        isMobile
    }
}