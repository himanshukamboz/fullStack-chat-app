import React, { useState, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const {sendMessage} = useChatStore()
  const handleImageChange = (e)=>{
    const file = e.target.files[0]
    if (!file.type.startsWith("image/")){
      toast.error("Please Select the image file")
      return
    }
    
    const reader = new FileReader()
    reader.onloadend = ()=>{
      setPreviewImage(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = ()=>{
    setPreviewImage(null)
    if (fileInputRef.current) fileInputRef.current.value =""
  }

  const handleSendMessage = async(e) => {
    e.preventDefault()

    if(!text.trim() && !previewImage)return

    try {
      
      await sendMessage({
        text:text.trim(),
        image:previewImage
      })

      setText("")
      setPreviewImage(null)
      if (fileInputRef.current) fileInputRef.current.value =""

    } catch (error) {
      console.error("Failed to send message",error)
    }
  }
  return (
    <div className="p-4 w-full">
      {previewImage && (
        <div className="mb-2 flex items-center gap-2">
          <div className="relative">
            <img src={previewImage} alt="Preview" 
            className="w-20 h-20 object-cover rounded-lg border-zinc-700" 
            />
            <button className="relative -top-21 -right-16 w-5 h-5 rounded-full bg-base-300 
            flex justify-center items-center"
            onClick={removeImage}>
              <X className="size-3"/>
            </button>

          </div>
        </div>
      )}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input type="text"
            className="flex input input-bordered rounded-lg input-sm outline-none md:w-full sm:input-md"
            value={text}
            onChange={(e)=>{setText(e.target.value)}}
          />
          <input type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <button className={`hidden sm:flex btn btn-circle
          ${previewImage?"text-emerald-500":"text-zinc-400"}`}
            type="button"
            onClick={()=>{fileInputRef?.current?.click()}}
          >
            <Image size={19}/>
          </button>
        </div>
        <button type="submit"
          className="btn btn-sm btn-circle flex justify-center items-center"
          disabled={!text.trim() && !previewImage}
        >
          <Send size={22}/>
        </button>
      </form>
      
    </div>
  );
};

export default MessageInput;
