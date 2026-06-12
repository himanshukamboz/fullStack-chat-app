import { MessageSquare,UserPlus,Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import GroupModal from "./CreateGroupModal";

const NoChatSelected = () => {
  const [showGroupModal, setShowGroupModal] = useState(false);
  const navigate = useNavigate()
  const handleCreateGroup = ({ name, members }) => {
    console.log("Creating group:", name, members);
    
  };
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
      {showGroupModal && (
      <GroupModal
        onClose={() => setShowGroupModal(false)}
        onCreateGroup={handleCreateGroup}
      />
    )}
      <div className="max-w-md text-center space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center
             justify-center animate-bounce"
            >
              <MessageSquare className="w-8 h-8 text-primary " />
            </div>
          </div>
        </div>
        {/* Welcome Text */}
        <h2 className="text-2xl font-bold">Welcome to Chatty!</h2>
        <div className="flex justify-center gap-6">
          {/* Add Friend */}
          <div
            onClick={() => navigate("/friends")}
            className="cursor-pointer w-24 h-24 rounded-2xl bg-base-200 hover:bg-primary/10 flex flex-col items-center justify-center gap-2 transition"
          >
            <UserPlus className="w-6 h-6" />
            <span className="text-sm">Add Friend</span>
          </div>
          <div
            onClick={() => setShowGroupModal(true)}
            className="cursor-pointer w-24 h-24 rounded-2xl bg-base-200 hover:bg-primary/10 flex flex-col items-center justify-center gap-2 transition"
          >
            <Users className="w-6 h-6" />
            <span className="text-sm">New Group</span>
          </div>
        </div>
        <p className="text-base-content/60">
          Select a conversation from the sidebar to start chatting
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;
