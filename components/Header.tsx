import { Logo } from "./logo";
import Image from "next/image";

const Header = () => {
  return (
    <div className="container flex h-[60px] shrink-0 items-center justify-center px-4 lg:h-[80px] lg:px-0">
      <a href="/">
        <div className="flex items-center">
          <Image 
            src="/newlogo.png" 
            alt="MasterBuilder Logo" 
            width={48} 
            height={48} 
            className="mr-2"
          />
          <span className="text-xl font-bold">
            <span className="bg-gradient-to-r from-primary to-[#FF7B29] bg-clip-text font-bold text-transparent">Master</span>
            <span className="text-black">Builder</span>
          </span>
        </div>
      </a>
    </div>
  );
};

export default Header;
