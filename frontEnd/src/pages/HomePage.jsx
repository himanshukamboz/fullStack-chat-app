import React from "react";
import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";


const HomePage = () => {
  const { selectedUser,selectedGroup } = useChatStore();
  
  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-12">
        <div className="bg-base-100 rounded-lg shadow-cl w-full  h-[calc(100vh-3rem)] flex flex-col">
          {/* Main content */}
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            {!selectedUser&&!selectedGroup ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
