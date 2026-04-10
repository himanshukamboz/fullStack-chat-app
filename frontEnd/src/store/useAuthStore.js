import {create} from "zustand"
import { axiosInstance } from "../lib/axios"
import toast from "react-hot-toast"
import {io} from "socket.io-client"

const BASE_URL = "http://localhost:8000"
export const useAuthStore = create((set,get)=>({
    authUser:null,
    isSigningUp:false,
    isLoggingIn:false,
    isUpdatingProfile:false,
    isCheckingAuth:true,
    isVerifying:false,
    onlineUsers:[],
    socket:null,
    checkAuth: async()=>{
        try {
            const res = await axiosInstance.get('/auth/check')
            set({authUser:res.data})
            get().connectSocket()
        } catch (error) {
            console.log("Error in checkAuth:",error)
            set({authUser:null})
        }
        finally{
            set({isCheckingAuth:false})
        }
    },
    signup:async(data)=>{
        set({isSigningUp:true})
        try {
           const res = await axiosInstance.post("/auth/signup",data)
           toast.success(res?.data?.message || "Otp sent")
           return {success:true, email:data.email}
        } catch (error) {
            toast.error(error?.response?.data?.message||"something went wrong")
            return {success:false}
        }
        finally{
            set({isSigningUp:false})
        }
    },

    verifyOtp: async (data) => {
        set({ isVerifying: true });
        try {
          const res = await axiosInstance.post("/auth/verify-otp", data);
      
          set({ authUser: res.data });
          toast.success("Account verified successfully");
      
          get().connectSocket();
      
          return { success: true };
      
        } catch (error) {
          toast.error(error?.response?.data?.message || "Invalid OTP");
          return { success: false };
        } finally {
          set({ isVerifying: false });
        }
      },
    logout:async()=>{
        try {
            await axiosInstance.get('/auth/logout')
            set({authUser:null})
            toast.success("Logged out successfully")
            get().disconnectSocket()
        } catch (error) {
            toast.error(error?.response?.data?.message||"something went wrong")
        }
    },
    login:async(data)=>{
        set({isLoggingIn:true})
        try {
            const res = await axiosInstance.post("/auth/login",data)
            console.log(res)
            set({authUser:res.data})
            toast.success("Logged in successfully")
            get().connectSocket()
        } catch (error) {
            
            toast.error(error?.response?.data?.message||"something went wrong")
        }
        finally{
            set({isLoggingIn:false})
        }
    },
    uploadProfile:async(data)=>{
        set({isUpdatingProfile:true})
        try {
            const res = await axiosInstance.put("/auth/update-profile",data)
            console.log(res.data)
            set({authUser:res.data})
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error(error?.response?.data?.message||"something went wrong")
        }
        finally{
            set({isUpdatingProfile:false})
        }
    },
    connectSocket:()=>{
        const {authUser} = get()
        if(!authUser || get().socket?.connected) return

        const socket = io(BASE_URL,{
            query:{
                userId:authUser._id
            }
        }) 
        socket.connect()
        set({socket:socket})
        socket.on("getOnlineUsers",(userIds)=>{
            set({onlineUsers:userIds})
        })
    },
    disconnectSocket:()=>{
        if(get().socket?.connected) get().socket?.disconnect();
    }
}))