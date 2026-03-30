export const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US",{
        hour:"2-digit",
        minute:"2-digit",
        hour12:true,
    })
}
export const getDateLabel = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
  
    const isToday =
      messageDate.toDateString() === now.toDateString();
  
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
  
    const isYesterday =
      messageDate.toDateString() === yesterday.toDateString();
  
    const diffInDays =
      (now - messageDate) / (1000 * 60 * 60 * 24);
  
    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";
  
    if (diffInDays < 7) {
      return messageDate.toLocaleDateString("en-US", {
        weekday: "long",
      });
    }
  
    return messageDate.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };