import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
export const useChatStore = create((set, get) => ({
  chatList:[],
  messages: [],
  users: [],
  usersTyping:[],
  groupUsersTyping: {}, 
  selectedChat:{},
  selectedUser: null,
  selectedGroup:null,
  groupMessages:[],
  isUsersLoading: false,
  isMessagesLoading: false,
  uploadProgress: 0,
  unreadCounts: {
    private: {},
    group: {},
  },
  getChatList: async () => {
    set({isUsersLoading: true});
    try{
      const res = await axiosInstance.get("/chats/chat-list")
      set({chatList:res.data})
    }
    catch(error){
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "something went wrong"
      );
    }
    finally{
      set({isUsersLoading:false})
    }
  },
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

  getGroupMessages: async (groupId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/messages/${groupId}`);
      set({ groupMessages: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendGroupMessage: async (data) => {
    const { groupMessages, selectedGroup } = get();
    const authUser = useAuthStore.getState().authUser;
    const tempId = Date.now();
  
    const tempMessage = {
      _id: tempId,
      text: data.text,
      image: data.image,
      senderId: authUser?._id,
      createdAt: new Date().toISOString(),
      isSending: true,
    };
  
    set({ groupMessages: [...groupMessages, tempMessage] });
  
    try {
      const res = await axiosInstance.post(`/groups/send/${selectedGroup._id}`, data);
  
      set((state) => ({
        groupMessages: state.groupMessages.map((msg) =>
          msg._id === tempId ? { ...res.data, isSending: false } : msg
        ),
      }));
  
      set((state) => {
        const updatedChatList = state.chatList
          .map((chat) =>
            chat.type === "group" && String(chat.group?._id) === String(selectedGroup._id)
              ? { ...chat, lastMessage: res.data.text, lastMessageTime: res.data.createdAt }
              : chat
          )
          .sort((a, b) => new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0));
        return { chatList: updatedChatList };
      });
    } catch (error) {
      set((state) => ({
        groupMessages: state.groupMessages.map((msg) =>
          msg._id === tempId ? { ...msg, isSending: false, isError: true } : msg
        ),
      }));
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  },

  createGroup: async ({ name, members }) => {
    try {
      await axiosInstance.post("/groups/create", { name, members });
      await get().getChatList();
      toast.success("Group created");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create group");
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
      const res = await axiosInstance.get("/messages/unread-counts");
  
      const privateCounts = {};
      const groupCounts = {};
  
      res.data.forEach((item) => {
        privateCounts[item._id] = item.count;
      });
  
      set({
        unreadCounts: {
          private: privateCounts,
          group: groupCounts,
        },
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
  sendGroupTyping: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedGroup } = get();
    console.log(selectedGroup)
    if (!socket || !selectedGroup) return;
    socket.emit("groupTyping", {
      groupId: selectedGroup._id,
      members: selectedGroup.members?.map((m) => m._id || m)
    });
  },
  
  sendGroupStopTyping: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedGroup } = get();
    if (!socket || !selectedGroup) return;
    socket.emit("groupStopTyping", {
      groupId: selectedGroup._id,
      members: selectedGroup.members?.map((m) => m._id || m),
    });
  },

  updateGroup: async (groupId, data) => {
    try {
      const res = await axiosInstance.put(`/groups/${groupId}`, data);
      set((state) => ({
        selectedGroup:
          state.selectedGroup?._id === groupId ? res.data : state.selectedGroup,
        chatList: state.chatList.map((chat) =>
          chat.type === "group" && String(chat.group?._id) === groupId
            ? { ...chat, group: res.data }
            : chat
        ),
      }));
      toast.success("Group updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update group");
    }
  },
  
  subscribeToMessages: () => {
    console.log("subscribe to messageEvents");

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

      set((state) => {
        const updatedChatList = state.chatList.map((chat) => {
          if (
            chat.type === "private" &&
            String(chat.user._id) === otherUserId
          ) {
            return {
              ...chat,
              lastMessage: newMessage.text,
              lastMessageTime: newMessage.createdAt,
            };
          }
      
          return chat;
        });
      
        updatedChatList.sort((a, b) => {
          return (
            new Date(b.lastMessageTime || 0) -
            new Date(a.lastMessageTime || 0)
          );
        });
      
        return {
          chatList: updatedChatList,
        };
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
          const updated = {
            ...state.unreadCounts,
            private: {
              ...state.unreadCounts.private,
            },
          };
          
          delete updated.private[senderId];
          
          return {
            unreadCounts: updated,
          };
        });
    
        return;
      }
      if (!isMyMessage) {
        console.log("event ocurring")
        set((state) => {
          const updated = {
            ...state.unreadCounts,
            private: {
              ...state.unreadCounts.private,
            },
          };
          
          updated.private[senderId] =
            (updated.private[senderId] || 0) + 1;
          
          return {
            unreadCounts: updated,
          };
        });
      }
    });

        
    socket.on("newGroupMessage", (newMessage) => {
      const { selectedGroup } = get();
      const isGroupOpen = selectedGroup && String(selectedGroup._id) === String(newMessage.groupId);
    
      if (isGroupOpen) {
        set((state) => ({ groupMessages: [...state.groupMessages, newMessage] }));
      } else {
        set((state) => {
          const updated = { ...state.unreadCounts, group: { ...state.unreadCounts.group } };
          const gId = String(newMessage.groupId);
          updated.group[gId] = (updated.group[gId] || 0) + 1;
          return { unreadCounts: updated };
        });
      }
    
      set((state) => {
        const updatedChatList = state.chatList
          .map((chat) =>
            chat.type === "group" && String(chat.group?._id) === String(newMessage.groupId)
              ? { ...chat, lastMessage: newMessage.text, lastMessageTime: newMessage.createdAt }
              : chat
          )
          .sort((a, b) => new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0));
        return { chatList: updatedChatList };
      });
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

    socket.on("userGroupTyping", ({ userId, groupId }) => {
      console.log("UserGroupTyping event",userId,groupId)
      set((state) => {
        const current = state.groupUsersTyping[groupId] || [];
        return {
          groupUsersTyping: {
            ...state.groupUsersTyping,
            [groupId]: [...new Set([...current, userId])],
          },
        };
      });
    });
    
    socket.on("userGroupStoppedTyping", ({ userId, groupId }) => {
      set((state) => {
        const current = state.groupUsersTyping[groupId] || [];
        return {
          groupUsersTyping: {
            ...state.groupUsersTyping,
            [groupId]: current.filter((id) => String(id) !== String(userId)),
          },
        };
      });
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
    if(!socket) return
    socket.off("newMessage");
    socket.off("newGroupMessage");
    socket.off("messageDelivered");
    socket.off("messageRead");
    socket.off("userTyping");
    socket.off("userStoppedTyping");
    socket.off("userGroupTyping");
    socket.off("userGroupStoppedTyping");
  },
  setSelectedUser: async (selectedUser) => {
    set({ selectedUser,selectedGroup: null  });
  
    if(!selectedUser) return
    const userId = selectedUser._id;
  
    set((state) => {
      const updated = {
        ...state.unreadCounts,
        private: {
          ...state.unreadCounts.private,
        },
      };
    
      delete updated.private[userId];
    
      return {
        unreadCounts: updated,
      };
    });
  
    try {
      await get().getMessages(userId);
      await get().markMessagesAsRead(userId);
    } catch (err) {
      console.log(err);
    }
  }
  ,
  setSelectedGroup: async (group) => {
    set({ selectedGroup: group, selectedUser: null }); // clear selectedUser too
    if (!group) return;
    set((state) => {
      const updated = { ...state.unreadCounts, group: { ...state.unreadCounts.group } };
      delete updated.group[group._id];
      return { unreadCounts: updated };
    });
    await get().getGroupMessages(group._id);
  },
}));
