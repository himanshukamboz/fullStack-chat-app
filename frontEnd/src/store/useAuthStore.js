import {create} from "zustand"
import { axiosInstance } from "../lib/axios"
import toast from "react-hot-toast"

export const useAuthStore = create((set)=>({
    authUser:null,
    isSigningUp:false,
    isLoggingIn:false,
    isUpdatingProfile:false,
    isCheckingAuth:true,
    onlineUsers:[],
    checkAuth: async()=>{
        try {
            const res = await axiosInstance.get('/auth/check')
            set({authUser:res.data})
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
           set({authUser:res.data})
           toast.success("Account created Successfully")
           
        } catch (error) {
            toast.error(error?.response?.data?.message||"something went wrong")
        }
        finally{
            set({isSigningUp:false})
        }
    },
    logout:async()=>{
        try {
            await axiosInstance.get('/auth/logout')
            set({authUser:null})
            toast.success("Logged out successfully")
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
    }
}))