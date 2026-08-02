import React from "react";
import { Search, X, ArrowLeft } from "lucide-react";

const Searchbar = ({ value, onChange, isMobileExpanded, onExpand, onCollapse }) => {
  return (
    <>
      <div className="hidden lg:block w-full pt-3 px-3">
        <div className="form-control">
          <div className="input input-bordered flex items-center gap-2 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/30 focus-within:outline-none transition-all duration-200">
            <Search className="size-5 opacity-70 shrink-0" />
            <input
              type="text"
              className="grow"
              placeholder="Search contacts..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
            {value && (
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-circle shrink-0"
                onClick={() => onChange("")}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Narrow sidebar (below lg): icon trigger, OR expanded search bar when active */}
      <div className="lg:hidden w-full pt-3 px-2">
        {isMobileExpanded ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-circle shrink-0"
              onClick={onCollapse}
            >
              <ArrowLeft size={16} />
            </button>
            <div className="input input-bordered input-sm flex items-center gap-2 flex-1">
              <Search className="size-4 opacity-70 shrink-0" />
              <input
                type="text"
                autoFocus
                className="grow"
                placeholder="Search..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
              {value && (
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-circle shrink-0"
                  onClick={() => onChange("")}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-circle"
              onClick={onExpand}
            >
              <Search size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Searchbar;