import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { useFriendStore } from "./useFriendStore";
export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  usersTyping:[],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  uploadProgress: 0,
  unreadCounts: {},
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "something went wrong"
      );
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (data) => {
    const { messages, selectedUser } = get();
    const authUser = useAuthStore.getState().authUser;
    const tempId = Date.now();

    const tempMessage = {
      _id: tempId,
      text: data.text,
      image: data.image,
      senderId: authUser?._id,
      createdAt: new Date().toISOString(),
      isSending: true,
      progress: 0,
    };

    set({ messages: [...messages, tempMessage], uploadProgress: 0 });

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        data,
        {
          onUploadProgress: (e) => {
            const percent = Math.round((e.loaded * 100) / e.total);

            const adjusted = Math.min(percent, 30);

            set((state) => ({
              uploadProgress: adjusted,
              messages: state.messages.map((msg) =>
                msg._id === tempId ? { ...msg, progress: adjusted } : msg
              ),
            }));
          },
        }
      );

      let fake = 30;
      const interval = setInterval(() => {
        fake += 5;
        if (fake >= 90) {
          clearInterval(interval);
        } else {
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg._id === tempId ? { ...msg, progress: fake } : msg
            ),
          }));
        }
      }, 200);
      
        set((state) => {
          const updatedMessages = state.messages.map((msg) =>
            msg._id === tempId
              ? { ...res.data, isSending: false, progress: 100 }
              : msg
          );
      
          console.log("AFTER REPLACE", updatedMessages);
      
          return {
            messages: updatedMessages,
            uploadProgress: 0,
          };
        });
      
      
    } catch (error) {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === tempId ? { ...msg, isSending: false, isError: true } : msg
        ),
        uploadProgress: 0,
      }));
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  },
  markMessagesAsRead: async (userId) => {
    try {
      await axiosInstance.patch(`/messages/read/${userId}`);
    } catch (error) {
      console.log(error);
    }
  },
  getUnreadCounts: async () => {
    try {
      const res = await axiosInstance.get(
        "/messages/unread-counts"
      );
  
      const counts = {};
  
      res.data.forEach((item) => {
        counts[item._id] = item.count;
      });
  
      set({
        unreadCounts: counts,
      });
    } catch (error) {
      console.log(error);
    }
  },
  sendTyping: ()=>{
    const socket = useAuthStore.getState().socket;
    const {selectedUser} = get()
    
    if (!socket || !selectedUser )return

    socket.emit('typing',{
      receiverId:selectedUser._id
    })
  },
  sendStopTyping: ()=>{
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();
    if (!socket || !selectedUser) return;

    socket.emit("stopTyping", {
      receiverId: selectedUser._id,
    });
  },
  subscribeToMessages: () => {
    console.log("subscribe to messageEvents");
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", async (newMessage) => {
      const authUser = useAuthStore.getState().authUser;
      if (!authUser) return;
    
      const myId = String(authUser._id);
      const senderId = String(newMessage.senderId);
      const receiverId = String(newMessage.receiverId);

      const otherUserId = senderId === myId ? receiverId : senderId;
    
      const selectedUser = get().selectedUser;
    
      const isMyMessage = senderId === myId;

      useFriendStore.setState((state) => {
        const updatedFriends = state.friends.map((f) => {
          if (String(f._id) === otherUserId) {
            return {
              ...f,
              lastMessage: newMessage.text,
              lastMessageTime: newMessage.createdAt,
            };
          }
          return f;
        });
        
      updatedFriends.sort((a, b) => {
          return new Date(b.lastMessageTime || 0) -
                 new Date(a.lastMessageTime || 0);
        });
    
        return { friends: updatedFriends };
      });
    
      const isChatOpen =
        selectedUser && String(selectedUser._id) === senderId;
    
      if (isChatOpen) {
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
    
        try {
          await get().markMessagesAsRead(senderId);
        } catch (err) {
          console.log("markMessagesAsRead error", err);
        }
    
        set((state) => {
          const updated = { ...state.unreadCounts };
          delete updated[senderId];
          return { unreadCounts: updated };
        });
    
        return;
      }
      if (!isMyMessage) {
        set((state) => {
          const updated = { ...state.unreadCounts };
    
          updated[senderId] = (updated[senderId] || 0) + 1;
    
          return { unreadCounts: updated };
        });
      }
    });

    socket.on("friendRemoved", ({ userId, friendId }) => {
      console.log(userId, friendId);
      const myId = String(useAuthStore.getState().authUser._id);

      const removedUserId =
        myId === String(userId) ? String(friendId) : String(userId);

      useFriendStore.setState((state) => ({
        friends: state.friends.filter((f) => String(f._id) !== removedUserId),
      }));
    });
    socket.on("messageDelivered", ({ messageId }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          String(msg._id) === String(messageId)
            ? { ...msg, status: "delivered" }
            : msg
        ),
      }));
    });
    socket.on("messageRead", ({ messageIds }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          messageIds.includes(msg._id)
            ? { ...msg, status: "read" }
            : msg
        ),
      }));
    });
    socket.on("userTyping",({userId})=>{
     set((state)=>({
      usersTyping: [...new Set([...state.usersTyping,userId])]
     }))
    });

    socket.on("userStoppedTyping", ({ userId }) => {
      console.log("stoptyping")
      set((state) => ({
        usersTyping: state.usersTyping.filter(
          (id) => String(id) !== String(userId)
        ),
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("friendRemoved");
    socket.off("messageDelivered");
    socket.off("messageRead");
    socket.off("userTyping");
    socket.off("userStoppedTyping");
  },
  setSelectedUser: async (selectedUser) => {
    set({ selectedUser });
  
    const userId = selectedUser._id;
  
    set((state) => {
      const updated = { ...state.unreadCounts };
      delete updated[userId];
      return { unreadCounts: updated };
    });
  
    try {
      await get().getMessages(userId);
      await get().markMessagesAsRead(userId);
    } catch (err) {
      console.log(err);
    }
  }
}));
