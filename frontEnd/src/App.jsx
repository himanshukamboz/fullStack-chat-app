import React, { useEffect } from 'react'
import { Route,Routes,Navigate } from 'react-router-dom'
import Navbar from './Navbar'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import { useAuthStore } from './store/useAuthStore'
import { Loader } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import { useThemeStore } from './store/useThemeStore'
const App = () => {
  const {authUser,checkAuth,isCheckingAuth} = useAuthStore()
  const {theme}=useThemeStore()
  useEffect(()=>{
    checkAuth()
  },[checkAuth])
  // useEffect(() => {
  //   document.documentElement.setAttribute("data-theme", theme)
  // }, [theme])

  if(isCheckingAuth && !authUser)return(
    <div className='flex items-center justify-center h-screen'>
      <Loader className='size-10 animate-spin' />
    </div>
  )

  
  return (
     <div >
      <Toaster/>
      <Navbar/>
      <Routes>
        <Route path='/' element={authUser?<HomePage/>:<Navigate to="/login"/>}/>
        <Route path='/signup' element={!authUser?<SignUpPage/>:<Navigate to="/"/>}/>
        <Route path='/login' element={!authUser?<LoginPage/>:<Navigate to="/"/>}/>
        <Route path='/profile' element={authUser?<ProfilePage/>:<Navigate to="/login"/>}/>
        <Route path='/settings' element={<SettingsPage/>}/>
      </Routes>
     </div>
    
  )
}

export default App