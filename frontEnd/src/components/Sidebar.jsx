import React, { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import SlidebarSkeleton from "../components/skeletons/SlidebarSkeleton";
import { Users } from "lucide-react";
import { formatMessageTime, makeParaFormatter } from "../lib/utils";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import { useGroupStore } from "../store/useGroupStore";
import Searchbar from "./Searchbar";
import Avatar from "./Avatar";

const Sidebar = () => {
  const {
    getChatList,
    chatList,
    selectedUser,
    setSelectedUser,
    setSelectedGroup,
    getUnreadCounts,
    unreadCounts,
    isUsersLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const { onlineUsers } = useAuthStore();
  const { subscribeToFriendEvents, unsubscribeFromFriendEvents } =
    useFriendStore();
  const { subscribeToGroupEvents, unsubscribeFromGroupEvents } =
    useGroupStore();

  useEffect(() => {
    getChatList();
    getUnreadCounts();
    subscribeToMessages();
    subscribeToFriendEvents();
    subscribeToGroupEvents();

    return () => {
      unsubscribeFromMessages();
      unsubscribeFromFriendEvents();
      unsubscribeFromGroupEvents();
    };
  }, []);

  const filteredChatList = chatList.filter((chat) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const name =
      chat.type === "private" ? chat.user?.fullName : chat.group?.name;
    return name?.toLowerCase().includes(query);
  });

  const handleCloseMobileSearch = () => {
    setIsMobileExpanded(false);
    setSearchQuery("");
  };

  if (isUsersLoading) return <SlidebarSkeleton />;

  return (
    <aside
      className={`h-full border-r border-base-300 flex flex-col transition-all duration-200 bg-base-100
      ${
        isMobileExpanded
          ? "w-72 fixed inset-y-0 left-0 z-40 lg:static lg:w-72"
          : "w-20 lg:w-72"
      }`}
    >
      <div className="border-b border-base-300 w-full py-5 px-7 lg:px-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Chats</span>
        </div>
      </div>
      <Searchbar
        value={searchQuery}
        onChange={setSearchQuery}
        isMobileExpanded={isMobileExpanded}
        onExpand={() => setIsMobileExpanded(true)}
        onCollapse={handleCloseMobileSearch}
      />
      <div className={`overflow-y-auto w-full lg:py-3`}>
        {filteredChatList.length === 0 && searchQuery.trim() && (
          <p className="text-sm text-base-content/50 text-center py-6 px-4">
            No chats found for "{searchQuery}"
          </p>
        )}

        {filteredChatList.map((chat) => {
          const isPrivate = chat.type === "private";

          const data = isPrivate ? chat.user : chat.group;

          if (!data) return null;
          const unread = isPrivate
            ? unreadCounts.private[chat.user._id] || 0
            : unreadCounts.group[chat.group._id] || 0;
          const showFullRow = isMobileExpanded;
          return (
            <button
              key={chat._id}
              onClick={() => {
                if (isPrivate) setSelectedUser(chat.user);
                else setSelectedGroup(chat.group);
                if (isMobileExpanded) handleCloseMobileSearch(); 
              }}
              className={`w-full p-2 flex items-center gap-3 hover:bg-base-300 transition-colors
            ${
              isPrivate && selectedUser?._id === chat?.user?._id
                ? "bg-base-300 ring-1 ring-base-300"
                : ""
            }`}
            >
              <div
                className={
                  showFullRow ? "relative" : "relative mx-auto lg:mx-0"
                }
              >
                <Avatar
                  src={isPrivate ? data.profilePic : data.groupImage}
                  name={isPrivate ? data.fullName : data.name}
                  size={isPrivate ? "size-12" : "size-14"}
                  isGroup={!isPrivate}
                />

                {isPrivate && onlineUsers.includes(data._id) && (
                  <span className="absolute bottom-1 right-0 size-2.5 bg-green-500 rounded-full ring-1 ring-zinc-900" />
                )}

                {unread > 0 && (
                  <div
                    className={`absolute -top-2 -right-2 badge badge-xs badge-primary text-xs ${
                      showFullRow ? "hidden" : "lg:hidden"
                    }`}
                  >
                    {unread}
                  </div>
                )}
              </div>

              <div
                className={`text-left min-w-0 flex-1 ${
                  showFullRow ? "block" : "hidden lg:block"
                }`}
              >
                <div className="font-medium truncate">
                  {isPrivate ? data.fullName : data.name}
                </div>
                <div className="text-sm text-zinc-400 truncate">
                  {makeParaFormatter(chat.lastMessage)}
                </div>
              </div>

              <div
                className={`flex-col gap-0.5 items-center ml-auto ${
                  showFullRow ? "flex" : "hidden lg:flex"
                }`}
              >
                <div className="text-xs text-zinc-500">
                  {chat.lastMessageTime
                    ? formatMessageTime(chat.lastMessageTime)
                    : ""}
                </div>
                {unread > 0 && (
                  <div className="badge badge-xs badge-primary">{unread}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
