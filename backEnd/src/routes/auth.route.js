import express from 'express'
import { checkAuth, login, logout, signup, updateProfile,verifyOtp } from '../controllers/index.js'
import { protectedRoute } from '../middleware/auth.middleware.js'
const router = express.Router()

router.post("/signup",signup)
router.post("/login",login)
router.get("/logout",logout)
router.post("/verify-otp",verifyOtp)
router.put('/update-profile',protectedRoute,updateProfile)
router.get('/check',protectedRoute,checkAuth)
export default router