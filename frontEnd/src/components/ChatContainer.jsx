import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime, getDateLabel } from "../lib/utils";
const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser } =
    useChatStore();
  const { authUser } = useAuthStore();
  useEffect(() => {
    getMessages(selectedUser._id);
  }, [selectedUser._id, getMessages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {messages.map((message, index) => {
          const currentDate = new Date(message.createdAt).toDateString();
          const prevDate =
            index > 0
              ? new Date(messages[index - 1].createdAt).toDateString()
              : null;

          const showDate = currentDate !== prevDate;

          return (
            <React.Fragment key={message._id}>
              {showDate && (
                <div className="text-center my-2">
                  <span className="text-xs bg-base-200 px-3 py-1 rounded-full">
                    {getDateLabel(message.createdAt)}
                  </span>
                </div>
              )}
              <div
                className={`chat ${
                  message.senderId === authUser._id ? "chat-end" : "chat-start"
                }`}
              >
                <div className={`chat-image avatar`}>
                  <div className="size-10 rounded-full border">
                    <img
                      src={
                        message.senderId === authUser._id
                          ? authUser.profilePic || "/avatar.png"
                          : selectedUser.profilePic || "/avatar.png"
                      }
                      alt="ProflePic"
                    />
                  </div>
                </div>
                <div className="chat-header mb-1">
                  <time className="text-xs opacity-50 ml-1">
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
                <div className="chat-bubble flex flex-col">
                  {message.image &&(<div className="relative w-fit">
                    {/* 📷 Image */}
                    <img
                      src={message.image}
                      alt="Attachment"
                      className={`sm:max-w-[200px] rounded-md ${
                        message.isSending ? "opacity-50" : ""
                      }`}
                    />

                    {/* 🔵 Overlay progress */}
                    {message.isSending && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-md">
                        {/* Circle or % */}
                        <span className="text-white text-sm font-semibold">
                          {message.progress || 0}%
                        </span>

                        {/* Optional bar inside */}
                        <div className="w-3/4 bg-gray-300 rounded-full h-1 mt-2">
                          <div
                            className="bg-blue-500 h-1 rounded-full transition-all duration-200"
                            style={{ width: `${message.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>)}
                  {message.text && <p>{message.text}</p>}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
