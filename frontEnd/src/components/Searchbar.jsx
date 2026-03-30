import React from "react";
import { Search } from "lucide-react";

const Searchbar = () => {
  return (
    <div className="w-full border-b border-base-300 p-3 ">
      <div className="form-control">
        <div className="input input-bordered flex items-center gap-2  focus-within:border-primary/50 
        focus-within:ring-1 
        focus-within:ring-primary/30 
        focus-within:outline-none
        transition-all duration-200">
          <Search className="size-5 opacity-70" />
          <input
            type="text"
            className="grow"
            placeholder="Search contacts..."
          />
        </div>
      </div>
    </div>
  );
};

export default Searchbar;