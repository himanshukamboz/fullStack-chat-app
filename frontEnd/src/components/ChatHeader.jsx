import { MoreVertical } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import { useState } from "react";
import GroupModal from "./CreateGroupModal";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showGroupModal, setShowGroupModal] = useState(false);
  const { removeFriend } = useFriendStore();

  const closeChat = () => setSelectedUser(null);
  const deleteGroup = () => console.log("Delete Group");
  const removeMember = () => console.log("Remove Member");
  const addAdmin = () => console.log("Add Admin");
  const addMember = () => console.log("Add Member");

  const handleCreateGroup = ({ name, members }) => {
    console.log("Creating group:", name, members);
    // call your API here later
  };

  return (
    <>
      {showGroupModal && (
        <GroupModal
          onClose={() => setShowGroupModal(false)}
          onCreateGroup={handleCreateGroup}
        />
      )}

      <div className="p-2.5 border-b border-base-300">
        <div className="flex items-center justify-between">

          {/* LEFT SIDE */}
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="size-10 rounded-full relative">
                <img
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt={selectedUser.fullName}
                />
              </div>
            </div>
            <div>
              <h3 className="font-medium">{selectedUser.fullName}</h3>
              <p className="text-sm text-base-content/70">
                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          {/* THREE DOT MENU */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <MoreVertical size={20} />
            </label>

            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              {!selectedUser?.isGroup && (
                <>
                  <li onClick={() => setShowGroupModal(true)}>
                    <a>New Group</a>
                  </li>
                  <li onClick={async () => {
                    await removeFriend(selectedUser?._id);
                    setSelectedUser(null);
                  }}>
                    <a>Remove Friend</a>
                  </li>
                  <li onClick={closeChat}>
                    <a>Close Chat</a>
                  </li>
                </>
              )}

              {selectedUser?.isGroup && (
                <>
                  <li onClick={deleteGroup}><a>Delete Group</a></li>
                  <li onClick={removeMember}><a>Remove Member</a></li>
                  <li onClick={addAdmin}><a>Add Admin</a></li>
                  <li onClick={addMember}><a>Add New Member</a></li>
                  <li onClick={closeChat}><a>Close Chat</a></li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatHeader;