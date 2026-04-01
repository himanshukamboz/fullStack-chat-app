import React from "react";
import { formatMessageTime, getDateLabel } from "../lib/utils";
import { useAuthStore } from "../store/useAuthStore";

const Message = ({ message, prevMessage, selectedUser }) => {
  const { authUser } = useAuthStore();

  const currentDate = new Date(message.createdAt).toDateString();
  const prevDate = prevMessage
    ? new Date(prevMessage.createdAt).toDateString()
    : null;

  const showDate = currentDate !== prevDate;

  return (
    <>
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
        {/* Avatar */}
        <div className="chat-image avatar">
          <div className="size-10 rounded-full border">
            <img
              src={
                message.senderId === authUser._id
                  ? authUser.profilePic || "/avatar.png"
                  : selectedUser.profilePic || "/avatar.png"
              }
              alt="ProfilePic"
            />
          </div>
        </div>

        {/* Time */}
        <div className="chat-header mb-1">
          <time className="text-xs opacity-50 ml-1">
            {formatMessageTime(message.createdAt)}
          </time>
        </div>

        {/* Message Content */}
        <div className="chat-bubble flex flex-col">
          {message.image && (
            <div className="relative w-fit">
              <img
                src={message.image}
                alt="Attachment"
                className={`sm:max-w-[200px] rounded-md ${
                  message.isSending ? "opacity-50" : ""
                }`}
              />

              {message.isSending && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-md">
                  <span className="text-white text-sm font-semibold">
                    {message.progress || 0}%
                  </span>

                  <div className="w-3/4 bg-gray-300 rounded-full h-1 mt-2">
                    <div
                      className="bg-blue-500 h-1 rounded-full"
                      style={{ width: `${message.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {message.text && <p>{message.text}</p>}
        </div>
      </div>
    </>
  );
};

export default Message;