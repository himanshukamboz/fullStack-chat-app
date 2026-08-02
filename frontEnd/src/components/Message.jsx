import React from "react";
import { formatMessageTime, getDateLabel } from "../lib/utils";
import { useAuthStore } from "../store/useAuthStore";

const Message = ({ message, prevMessage, selectedUser, isGroup = false }) => {
  const { authUser } = useAuthStore();

  const senderId = isGroup
    ? String(message.senderId?._id || message.senderId)
    : message.senderId;
  const isMine = String(senderId) === String(authUser._id);

  const senderName = isGroup ? message.senderId?.fullName : null;
  const senderPic = isGroup
    ? message.senderId?.profilePic || "/avatar.png"
    : isMine
    ? authUser.profilePic || "/avatar.png"
    : selectedUser?.profilePic || "/avatar.png";

  const currentDate = new Date(message.createdAt).toDateString();
  const prevDate = prevMessage ? new Date(prevMessage.createdAt).toDateString() : null;
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

      <div className={`chat ${isMine ? "chat-end" : "chat-start"}`}>
        <div className="chat-image avatar">
          <div className="size-10 rounded-full border">
            <img src={senderPic} alt="ProfilePic" />
          </div>
        </div>

        <div className="chat-header mb-1">
          <time className="text-xs opacity-50 ml-1">
            {formatMessageTime(message.createdAt)}
          </time>
        </div>

        {/* max-w constrains bubble width so wrapping actually kicks in */}
        <div className="chat-bubble p-0 flex flex-col max-w-[75vw] sm:max-w-xs md:max-w-sm">
          {isGroup && !isMine && (
            <div className="text-[11px] m-0 font-bold opacity-70 truncate px-2 mx-2 pt-1">
              {senderName}
            </div>
          )}
          {message.image && (
            <div className="relative w-fit">
              <img
                src={message.image}
                alt="Attachment"
                className={`sm:max-w-[200px] rounded-md ${message.isSending ? "opacity-50" : ""}`}
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
          {message.text && (
            <p
              className={`mx-4 whitespace-pre-wrap break-words ${
                isMine ? "my-2" : "mb-2"
              }`}
            >
              {message.text}
            </p>
          )}
        </div>

        {isMine && !isGroup && (
          <span className="text-xs ml-2 opacity-70">
            {message.status === "sent" && "✓"}
            {message.status === "delivered" && "✓✓"}
            {message.status === "read" && <span className="text-blue-500">✓✓</span>}
          </span>
        )}
      </div>
    </>
  );
};

export default Message;