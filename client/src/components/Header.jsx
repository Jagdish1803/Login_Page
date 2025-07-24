import React from "react";
import { assets } from "../assets/assets";

const Header = () => {
  return (
    <div className="flex flex-col items-center mt-20 px-4 text-center text-gray-800">
      <img src={assets.header_img} className="w-35 h-35 rounded-full mb-6" />
      <h1 className="flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2">
        Hey User <img className="w-8 aspect-square" src={assets.hand_wave} />
      </h1>
      <h2 className="text-3xl sm:text-5xl font-semibold mb-4">
        Welcome to our app
      </h2>
      <p className="mb-8 max-w-md">
        Lets start with a quick product tour and we will have you up and running
        in no time!
      </p>
      <button className="border border-gray-500 rounded-full px-8 py-2.5 hover:ng-gray-100 transition-all cursor-pointer">
        Get started
      </button>
    </div>
  );
};

export default Header;
