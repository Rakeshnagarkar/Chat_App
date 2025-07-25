import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "../components/ChatHeader";
import MessageInput from "../components/MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";

import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

function ChatContainer() {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    socket,
  } = useChatStore();
  const { authUser } = useAuthStore();

  const chatBoxRef = useRef(null); // ✅ Ref for scroll container

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }

    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [
    getMessages,
    selectedUser?._id,
    subscribeToMessages,
    unsubscribeFromMessages,
    socket,
  ]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div
        className="flex-1 overflow-y-auto space-y-4 p-4"
        ref={chatBoxRef} // ✅ Apply ref to scrollable container
      >
        {isMessagesLoading ? (
          <>
            <MessageSkeleton />
            <MessageSkeleton />
            <MessageSkeleton />
          </>
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message._id}
              className={`chat ${
                message.senderId === authUser._id ? "chat-end" : "chat-start"
              }`}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      message.senderId === authUser._id
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>
              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div className="chat-bubble flex flex-col">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && <p>{message.text}</p>}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400">No messages yet.</p>
        )}
      </div>

      <MessageInput />
    </div>
  );
}

export default ChatContainer;