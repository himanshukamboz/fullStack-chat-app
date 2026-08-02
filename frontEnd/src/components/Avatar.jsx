const COLORS = [
    "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-yellow-500",
    "bg-lime-500", "bg-green-500", "bg-emerald-500", "bg-teal-500",
    "bg-cyan-500", "bg-sky-500", "bg-blue-500", "bg-indigo-500",
    "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", "bg-pink-500", "bg-rose-500",
  ];

const getInitials = (name)=>{
    if(!name) return "?"
    const parts = name.trim().split(" ")
    if(parts.length===1) return parts[0].slice(0,2).toUpperCase();
    return parts[0][0]+parts[parts.length-1][0]
}
const getColorForName = (name)=>{
    let hash = 0
    for(let i = 0;i<name.length; i++ ){
        hash = name.charCodeAt(i)+((hash << 5) - hash)
    }
    return COLORS[Math.abs(hash)%COLORS.length]
} 

const Avatar = ({ src, name, size = "size-10", isGroup }) => {
    if (src || isGroup) {
      return (
        <img
          src={src || '/group.png'}
          alt={name || "avatar"}
          className={`${size} rounded-full object-cover `}
        />
      );
    }
  
    return (
      <div
        className={`${size} rounded-full flex items-center justify-center text-white font-semibold ${getColorForName(
          name
        )}`}
        style={{ fontSize: "0.4em" }}
      >
        <span className="text-[0.9rem]">{getInitials(name)}</span>
      </div>
    );
  };
  
  export default Avatar;