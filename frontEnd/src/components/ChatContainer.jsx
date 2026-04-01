import React, { useEffect,useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import Message from "./Message";
const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser } =useChatStore();
  const messagesEndRef = useRef(null)
  useEffect(() => {
    getMessages(selectedUser._id);
  }, [selectedUser._id, getMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: messages.length>0 ?"smooth":"auto" });
  }, [messages]);

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
        {messages.map((message, index) => (
          <Message
            key={message._id}
            message={message}
            prevMessage={messages[index - 1]}
            selectedUser={selectedUser}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
