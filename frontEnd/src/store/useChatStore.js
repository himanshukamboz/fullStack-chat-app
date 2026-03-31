import {create } from 'zustand'
import toast from "react-hot-toast"
import {axiosInstance} from "../lib/axios"

export const useChatStore = create((set,get)=>({
    messages:[],
    users:[],
    selectedUser:null,
    isUsersLoading:false,
    isMessagesLoading:false,
    uploadProgress:0,
    getUsers: async()=>{
        set({isUsersLoading:true})
        try {
            const res = await axiosInstance.get("/messages/users")
            set({users:res.data})
        } catch (error) {
            toast.error(error.response.data.message)
        }
        finally{
            set({isUsersLoading:false})
        }
    },
    getMessages: async(userId)=>{
        set({isMessagesLoading:true})
        try {
            const res = await axiosInstance.get(`/messages/${userId}`)
            set({messages:res.data})
        } catch (error) {
            toast.error(error.response.data.message)
        }
        finally{
            set({isMessagesLoading:false})
        }
    },
    sendMessage: async (data) => {
        const { messages, selectedUser } = get();
      
        const tempId = Date.now();
      
        const tempMessage = {
          _id: tempId,
          text: data.text,
          image: data.image,
          senderId: "me",
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
                    msg._id === tempId
                      ? { ...msg, progress: adjusted }
                      : msg
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
                  msg._id === tempId
                    ? { ...msg, progress: fake }
                    : msg
                ),
              }));
            }
          }, 200);
      
          setTimeout(() => {
            set((state) => ({
              messages: state.messages.map((msg) =>
                msg._id === tempId
                  ? { ...res.data, isSending: false, progress: 100 }
                  : msg
              ),
              uploadProgress: 0,
            }));
          }, 500);
        } catch (error) {
            set((state) => ({
              messages: state.messages.map((msg) =>
                msg._id === tempId
                  ? { ...msg, isSending: false, isError: true }
                  : msg
              ),
              uploadProgress: 0,
            }));
            toast.error(
              error?.response?.data?.message || "Failed to send message"
            );
          }
      },
    setSelectedUser:(selectedUser)=>set({selectedUser})
}))