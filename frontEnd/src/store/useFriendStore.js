import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useFriendStore = create((set, get) => ({
  friends: [],
  friendRequests: [], 
  sentRequests: [],   
  isLoading: false,

  getAllFriends: async () => {
    try {
      set({ isLoading: true });

      const res = await axiosInstance.get("/friends");
      set({ friends: res.data.friends });

    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching friends");
    } finally {
      set({ isLoading: false });
    }
  },
  getFriendRequests: async () =>{
    try {
        set({ isLoading: true });
  
        const res = await axiosInstance.get("/friends/getRequests");
        set({ friendRequests: res?.data?.requests });
  
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching friends");
      } finally {
        set({ isLoading: false });
      }
  },

  getSentRequests: async () => {
    try {
      const res = await axiosInstance.get("/friends/sentRequests");
  
      set({ sentRequests: res.data.requests });
  
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching sent requests");
    }
  },

  sendFriendRequest: async (receiverId) => {
    try {
      const res = await axiosInstance.post("/friends/add", { receiverId });

      set((state) => {
        const exists = state.sentRequests.some(
          (r) => r._id === res?.data?.request?._id
        );
      
        if (exists) return state;
      
        return {
          sentRequests: [...state.sentRequests, res?.data?.request],
        };
      });

      toast.success("Friend request sent");

    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending request");
    }
  },

  acceptRequest: async (senderId) => {
    try {
      await axiosInstance.post("/friends/accept", { senderId });
      get().getAllFriends();
  
      toast.success("Friend added");
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  },

  removeFriend: async (friendId) => {
    try {
      await axiosInstance.post("/friends/remove", { friendId });
  
      set((state) => ({
        friends: state.friends.filter((f) => f._id !== friendId),
      }));
      get().getFriendRequests();
      toast.success("Friend removed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error removing friend");
    }
  },

  rejectRequest: async (senderId) => {
    try {
      await axiosInstance.patch("/friends/reject", { senderId });

      set((state) => ({
        friendRequests: state.friendRequests.filter((req) => {
          const id = req?.sender?._id ?? req?.sender;
          return String(id) !== String(senderId);
        }),
      }));

      toast.success("Request rejected");

    } catch (error) {
      toast.error(error.response?.data?.message || "Error rejecting request");
    }
  },

  cancelRequest: async (receiverId) => {
    try {
      await axiosInstance.delete(`/friends/cancel/${receiverId}`);

      set((state) => ({
        sentRequests: state.sentRequests.filter(
          (req) =>
            (req?.receiver?._id || req?.receiver) !== receiverId
        ),
      }));

      toast.success("Request cancelled");

    } catch (error) {
      toast.error(error.response?.data?.message || "Error cancelling request");
    }
  },

  subscribeToFriendEvents: () => {
    const socket = useAuthStore.getState().socket;
    console.log("subscibed friendEvents")
    if (!socket) return;

    socket.on("newFriendRequest", ({ request }) => {
      set((state) => {
        const exists = state.friendRequests.some(
          (r) => r._id === request._id
        );
    
        if (exists) return state;
    
        return {
          friendRequests: [...state.friendRequests, request],
        };
      });
    });

    socket.on("requestAccepted", ({ receiverId }) => {
      set((state) => ({
        sentRequests: state.sentRequests.filter((req) => {
          const id = req?.receiver?._id ?? req?.receiver;
          return String(id) !== String(receiverId);
        }),
      }));
    
      get().getAllFriends();
    });

    socket.on("requestAcceptedByMe", ({ senderId }) => {
      set((state) => ({
        friendRequests: state.friendRequests.filter((req) => {
          const id = req?.sender?._id ?? req?.sender;
          return String(id) !== String(senderId);
        }),
      }));
    
      get().getAllFriends();
    });

    socket.on("requestCancelled", ({ senderId }) => {
      set((state) => ({
        friendRequests: state.friendRequests.filter((req) => {
          const id = req?.sender?._id ?? req?.sender;
          return String(id) !== String(senderId);
        }),
      }));
    });

    socket.on("requestRejected", ({ receiverId }) => {
      set((state) => ({
        sentRequests: state.sentRequests.filter((req) => {
          const id = req?.receiver?._id ?? req?.receiver;
          return String(id) !== String(receiverId);
        }),
      }));
    });

    socket.on("friendRemoved", ({ userId, friendId }) => {
      console.log("friendremoved")
    });
  },

  unsubscribeFromFriendEvents: () => {
    const socket = useAuthStore.getState().socket;

    if (!socket) return;

    socket.off("newFriendRequest");
    socket.off("requestAccepted");
    socket.off("requestCancelled");
    socket.off("friendRemoved")
    socket.off("requestRejected");
    
  },
}));