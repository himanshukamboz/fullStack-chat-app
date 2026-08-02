import React, {useState, useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import Message from "./Message";
import GroupProfilePage from "./GroupProfile";
const ChatContainer = () => {
  const {
    messages,
    groupMessages,
    getMessages,
    getGroupMessages,
    markMessagesAsRead,
    isMessagesLoading,
    selectedUser,
    selectedGroup,
    usersTyping,
    groupUsersTyping,
    
  } = useChatStore();
  
  
const [showGroupProfile, setShowGroupProfile] = useState(false);



  const messagesEndRef = useRef(null);
  const isGroup = !!selectedGroup;
 
  const activeMessages = isGroup ? groupMessages : messages;

  const typingUserIds = isGroup ? groupUsersTyping[selectedGroup?._id] || [] : [];
  const typingNames = isGroup
    ? typingUserIds
        .map(
          (id) =>
            selectedGroup?.members?.find((m) => String(m._id) === String(id))?.fullName
        )
        .filter(Boolean)
    : [];

  const isTyping = isGroup
    ? typingUserIds.length > 0
    : !!selectedUser && usersTyping.includes(selectedUser._id);

  useEffect(() => {
    if (isGroup) {
      getGroupMessages(selectedGroup._id);
    } else if (selectedUser) {
      getMessages(selectedUser._id);
      markMessagesAsRead(selectedUser._id);
    }

  }, [selectedUser?._id, selectedGroup?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: activeMessages.length > 0 ? "smooth" : "auto",
    });
  }, [activeMessages]);

  if (!selectedUser && !selectedGroup) return null;
  if (showGroupProfile && isGroup) {
    return <GroupProfilePage group={selectedGroup} onBack={() => setShowGroupProfile(false)} />;
  }


  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput isGroup={isGroup} />
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader onOpenGroupProfile={() => setShowGroupProfile(true)} />
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {activeMessages.map((message, index) => (
          <Message
            key={message._id}
            message={message}
            prevMessage={activeMessages[index - 1]}
            selectedUser={selectedUser}
            isGroup={isGroup}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {isTyping && (
        <div className="px-4 py-2">
          <div className="chat chat-start">
            <div className="chat-bubble">
              {isGroup && (
                <p className="text-[11px] font-bold opacity-70 mb-1">
                {typingNames.length > 0 ? typingNames.join(", ") : "Someone"}
              </p>
              )}
              <span className="loading loading-dots loading-sm"></span>
            </div>
          </div>
        </div>
      )}

      <MessageInput isGroup={isGroup} />
    </div>
  );
};

export default ChatContainer;