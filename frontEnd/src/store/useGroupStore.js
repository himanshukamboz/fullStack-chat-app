import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useChatStore } from "./useChatStore";
import { useAuthStore } from "./useAuthStore";
export const useGroupStore = create((set, get) => ({
  exitGroup: async (groupId) => {
    try {
      await axiosInstance.post(`/groups/${groupId}/exit`);

      useChatStore.setState((state) => ({
        chatList: state.chatList.filter(
          (chat) =>
            !(chat.type === "group" && String(chat.group?._id) === groupId)
        ),
        selectedGroup:
          state.selectedGroup?._id === groupId ? null : state.selectedGroup,
      }));

      toast.success("You left the group");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to exit group");
    }
  },

  addGroupMember: async (groupId, memberIds) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/members`, {
        memberIds,
      });

      useChatStore.setState((state) => ({
        selectedGroup:
          state.selectedGroup?._id === groupId ? res.data : state.selectedGroup,
        chatList: state.chatList.map((chat) =>
          chat.type === "group" && String(chat.group?._id) === groupId
            ? { ...chat, group: res.data }
            : chat
        ),
      }));

      toast.success("Member added");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add member");
    }
  },

  deleteGroup: async (groupId) => {
    try {
      await axiosInstance.delete(`/groups/${groupId}`);

      useChatStore.setState((state) => ({
        chatList: state.chatList.filter(
          (chat) =>
            !(chat.type === "group" && String(chat.group?._id) === groupId)
        ),
        selectedGroup:
          state.selectedGroup?._id === groupId ? null : state.selectedGroup,
      }));

      toast.success("Group deleted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete group");
    }
  },

  removeGroupMember: async (groupId, memberIds) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/remove-member`, {
        memberIds,
      });

      useChatStore.setState((state) => ({
        selectedGroup:
          state.selectedGroup?._id === groupId ? res.data : state.selectedGroup,
        chatList: state.chatList.map((chat) =>
          chat.type === "group" && String(chat.group?._id) === groupId
            ? { ...chat, group: res.data }
            : chat
        ),
      }));

      toast.success("Member removed");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove member");
    }
  },

  makeGroupAdmin: async (groupId, memberIds) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/make-admin`, { memberIds });
  
      useChatStore.setState((state) => ({
        selectedGroup: state.selectedGroup?._id === groupId ? res.data : state.selectedGroup,
        chatList: state.chatList.map((chat) =>
          chat.type === "group" && String(chat.group?._id) === groupId
            ? { ...chat, group: res.data }
            : chat
        ),
      }));
  
      toast.success(memberIds.length > 1 ? "Members promoted to admin" : "Member promoted to admin");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to promote member");
    }
  },

  demoteGroupAdmin: async (groupId, memberIds) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/demote-admin`, { memberIds });
  
      useChatStore.setState((state) => ({
        selectedGroup: state.selectedGroup?._id === groupId ? res.data : state.selectedGroup,
        chatList: state.chatList.map((chat) =>
          chat.type === "group" && String(chat.group?._id) === groupId
            ? { ...chat, group: res.data }
            : chat
        ),
      }));
  
      toast.success(memberIds.length > 1 ? "Admins demoted" : "Admin demoted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to demote admin");
    }
  },
  
  subscribeToGroupEvents: () => {
    const socket = useAuthStore.getState().socket;
    socket.on("groupMemberLeft", ({ groupId, userId }) => {
      useChatStore.setState((state) => ({
        selectedGroup:
          state.selectedGroup?._id === groupId
            ? {
                ...state.selectedGroup,
                members: state.selectedGroup.members?.filter(
                  (m) => String(m._id) !== String(userId)
                ),
              }
            : state.selectedGroup,
        chatList: state.chatList.map((chat) =>
          chat.type === "group" && String(chat.group?._id) === String(groupId)
            ? {
                ...chat,
                group: {
                  ...chat.group,
                  members: chat.group.members?.filter(
                    (m) => String(m._id) !== String(userId)
                  ),
                },
              }
            : chat
        ),
      }));
    });

    socket.on("groupDeleted", ({ groupId }) => {
      
      useChatStore.setState((state) => ({
        selectedGroup:state.selectedGroup?._id === groupId ? null : state.selectedGroup,
        chatList: state.chatList.filter(
          (chat) =>
            !(
              chat.type === "group" &&
              String(chat.group?._id) === String(groupId)
            )
        ),
      }));
      toast("A group you were in was deleted", { icon: "⚠️" });
    });

    socket.on("groupMemberAdded", ({ groupId, chatId, group }) => {
      useChatStore.setState((state) => {
        const existingChat = state.chatList.find(
          (chat) =>
            chat.type === "group" && String(chat.group?._id) === String(groupId)
        );

        if (existingChat) {
          return {
            selectedGroup:
              state.selectedGroup?._id === groupId
                ? group
                : state.selectedGroup,
            chatList: state.chatList.map((chat) =>
              chat.type === "group" &&
              String(chat.group?._id) === String(groupId)
                ? { ...chat, group }
                : chat
            ),
          };
        }

        const newChatEntry = {
          _id: chatId,
          type: "group",
          group,
          lastMessage: "",
          lastMessageTime: new Date().toISOString(),
        };

        return {
          chatList: [newChatEntry, ...state.chatList],
        };
      });
    });

    socket.on("groupMemberRemoved", ({ groupId, group }) => {
      useChatStore.setState((state) => ({
        selectedGroup:
          state.selectedGroup?._id === groupId ? group : state.selectedGroup,
        chatList: state.chatList.map((chat) =>
          chat.type === "group" && String(chat.group?._id) === String(groupId)
            ? { ...chat, group }
            : chat
        ),
      }));
    });

    socket.on("removedFromGroup", ({ groupId }) => {
      useChatStore.setState((state) => ({
        chatList: state.chatList.filter(
          (chat) =>
            !(
              chat.type === "group" &&
              String(chat.group?._id) === String(groupId)
            )
        ),
        selectedGroup:
          state.selectedGroup?._id === groupId ? null : state.selectedGroup,
      }));
      toast("You were removed from a group", { icon: "⚠️" });
    });

    socket.on("groupAdminUpdated", ({ groupId, group }) => {
      useChatStore.setState((state) => ({
        selectedGroup: state.selectedGroup?._id === groupId ? group : state.selectedGroup,
        chatList: state.chatList.map((chat) =>
          chat.type === "group" && String(chat.group?._id) === String(groupId)
            ? { ...chat, group }
            : chat
        ),
      }));
    });
  },
  unsubscribeFromGroupEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("groupMemberLeft");
    socket.off("groupDeleted");
    socket.off("groupMemberAdded");
    socket.off("removedFromGroup");
    socket.off("groupMemberRemoved");
    socket.off("groupAdminUpdated")
  },
}));
