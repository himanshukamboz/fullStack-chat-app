import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import SlidebarSkeleton from "../components/skeletons/SlidebarSkeleton";
import { Users } from "lucide-react";
import { formatMessageTime,makeParaFormatter } from "../lib/utils";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUserLoading } =
    useChatStore();
  const { onlineUsers } = useAuthStore();
  const { friends, getAllFriends, isLoading } = useFriendStore();
  const { getUnreadCounts, unreadCounts } = useChatStore();

  useEffect(() => {
    getAllFriends();
    getUnreadCounts();
  }, [getAllFriends]);


  if (isLoading) return <SlidebarSkeleton />;
  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full py-5 px-7 lg:px-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        {/* Todo online */}
      </div>

      <div className="overflow-y-auto w-full py-3">
        {friends.map((user) => (
          <button
            key={user._id}
            onClick={() => {
              setSelectedUser(user);
            }}
            className={`w-full 
             p-2 flex items-center 
             gap-3 hover:bg-base-300 
             transition-colors
             ${
               selectedUser?._id === user._id
                 ? "bg-base-300 ring-1 ring-base-300"
                 : ""
             }
             `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.fullName}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
              {unreadCounts[user._id] > 0 && (
                <div className="absolute -top-2 -right-2 lg:hidden badge badge-xs badge-primary text-xs">
                  {unreadCounts[user._id]}
                </div>
              )}
            </div>
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {/* {onlineUsers.includes(user._id) ? "Online" : "Offline"} */}
                {makeParaFormatter(user.lastMessage)}
              </div>
            </div>
            <div className="hidden lg:flex flex-col gap-0.5 items-center ml-auto">
              <div className="text-xs text-zinc-500">
                {user.lastMessageTime
                  ? formatMessageTime(user.lastMessageTime)
                  : ""}
              </div>
              {unreadCounts[user._id] > 0 && (
                <div className="badge badge-xs badge-primary">
                  {unreadCounts[user._id]}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
