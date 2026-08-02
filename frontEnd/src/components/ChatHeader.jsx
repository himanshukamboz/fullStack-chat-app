import { MoreVertical } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import { useGroupStore } from "../store/useGroupStore";
import { useState } from "react";
import GroupModal from "./CreateGroupModal";
import MemberActionModal from "./MemberActionModal";

const ChatHeader = ({onOpenGroupProfile}) => {
  const { selectedUser, selectedGroup, setSelectedUser, setSelectedGroup } = useChatStore();
  const { onlineUsers,authUser } = useAuthStore();
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showMemberModal,setShowMemberModal] = useState(null)
  const { removeFriend } = useFriendStore();
  const {deleteGroup,exitGroup} = useGroupStore();

  const isGroup = !!selectedGroup;
  const chatData = isGroup ? selectedGroup : selectedUser;
  if (!chatData) return null;
  const isAdmin = chatData.admins?.some((admin)=> String(admin?._id||admin)===String(authUser?._id))

  const closeChat = () => (isGroup ? setSelectedGroup(null) : setSelectedUser(null));
  const addAdmin = () => console.log("Add Admin");

  const { createGroup } = useChatStore();
  const handleCreateGroup = async ({ name, members }) => {
    await createGroup({ name, members });
  };
  const handleExitGroup = async()=>{
    if (!window.confirm("Are you sure you want to exit this group?")) return;
    await exitGroup(selectedGroup?._id);
  }
  return (
    <>
      {showGroupModal && (
        <GroupModal
          onClose={() => setShowGroupModal(false)}
          onCreateGroup={handleCreateGroup}
        />
      )}
      {
        showMemberModal &&(
          <MemberActionModal mode={showMemberModal} group={selectedGroup} onClose={()=>setShowMemberModal(false)}/>
        )
      }
      <div className="p-2.5 border-b border-base-300">
        <div className="flex items-center justify-between">
          {/* LEFT SIDE */}
          <div className="flex items-center gap-3 cursor-pointer"
          onClick={()=>isGroup && onOpenGroupProfile?.()}>
            <div className="avatar">
              <div className="size-10 rounded-full relative">
                <img
                  src={
                    isGroup
                      ? chatData.groupImage || "/group.png"
                      : chatData.profilePic || "/avatar.png"
                  }
                  alt={isGroup ? chatData.name : chatData.fullName}
                />
              </div>
            </div>
            <div>
              <h3 className="font-medium">{isGroup ? chatData.name : chatData.fullName}</h3>
              <p className="text-sm text-base-content/70">
                {isGroup
                  ? `${chatData.members?.length || 0} members`
                  : onlineUsers.includes(chatData._id)
                  ? "Online"
                  : "Offline"}
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
              {!isGroup && (
                <>
                  <li onClick={() => setShowGroupModal(true)}>
                    <a>New Group</a>
                  </li>
                  <li
                    onClick={async () => {
                      await removeFriend(chatData?._id);
                      setSelectedUser(null);
                    }}
                  >
                    <a>Remove Friend</a>
                  </li>
                  <li onClick={closeChat}>
                    <a>Close Chat</a>
                  </li>
                </>
              )}
              {isGroup && (
                <>
                  {isAdmin && (<li onClick={async()=>await deleteGroup(selectedGroup?._id)}><a>Delete Group</a></li>)}
                  {isAdmin && (<li onClick={()=>setShowMemberModal("remove")}><a>Remove Member</a></li>)}
                  {isAdmin && (<li onClick={()=>setShowMemberModal("add")}><a>Add New Member</a></li>)}
                  <li onClick={handleExitGroup}><a>Exit Group</a></li>
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