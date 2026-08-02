import { useEffect, useState } from "react";
import { Search, UserPlus, Check, X,Loader } from "lucide-react";
import { useFriendStore } from "../store/useFriendStore";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { nameFormatter } from "../lib/utils";
export default function AddFriendsUI() {
  const { authUser } = useAuthStore();
  const [search, setSearch] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const { users, getUsers } = useChatStore();
  const {
    friends,
    friendRequests,
    sentRequests,
    sendFriendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    getAllFriends,
    getFriendRequests,
    getSentRequests,
    isLoading,
    subscribeToFriendEvents,
    unsubscribeFromFriendEvents,
  } = useFriendStore();

  useEffect(() => {
    const load = async () => {
      setPageLoading(true);
  
      await Promise.all([
        getUsers(),
        getAllFriends(),
        getFriendRequests(),
        getSentRequests(),
      ]);
  
      subscribeToFriendEvents();
  
      setPageLoading(false);
    };
  
    load();
  
    return () => unsubscribeFromFriendEvents();
  }, []);
  const filteredUsers = users.filter((user) => {
    const isMe = user._id === authUser?._id;
  
    
    const isAlreadyFriend = (friends || []).some(
      (f) => f._id === user._id
    );
  
    const isRequestSent = (sentRequests || []).some((req) => {
      const id = req?.receiver?._id ?? req?.receiver;
      return String(id) === String(user._id);
    });
  
    const isRequestReceived = (friendRequests || []).some(
      (req) => req.sender?._id === user._id && req.status === "pending"
    );
  
    const matchesSearch =
      user.fullName?.toLowerCase().includes(search.toLowerCase());
  
    return (
      matchesSearch &&
      !isMe &&
      !isAlreadyFriend &&
      !isRequestSent &&
      !isRequestReceived
    );
  });
  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
         <Loader className='size-10 animate-spin' />
      </div>
    );
  }
  return (
    <div className="p-6 max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-6">Add Friends</h1>
      {/* 🔍 Search */}
      <div className="form-control mb-6">
        <div className="input input-bordered flex items-center gap-2">
          <Search className="w-5 h-5 opacity-60" />
          <input
            type="text"
            placeholder="Search users..."
            className="grow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div>
        {friendRequests.length !==0 &&(
        <>
        <h2 className="text-lg font-semibold mb-4">Friend Requests</h2>

          <div className="space-y-4">
            {friendRequests.map((req) => (
              <div key={req._id} className="card bg-base-100 shadow-md border">
                <div className="card-body flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-10 rounded-full bg-base-300">
                        <img
                          src={req?.sender?.profilePic || "avatar.png"}
                          alt={req?.sender?.fullName}
                        />
                      </div>
                    </div>
                    <p className="font-medium">
                      {nameFormatter(req?.sender?.fullName) || "User"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptRequest(req?.sender?._id)}
                      className="btn btn-success btn-sm"
                    >
                      <Check size={16} /> Accept
                    </button>

                    <button
                      onClick={() => rejectRequest(req?.sender?._id)}
                      className="btn btn-error btn-sm"
                    >
                      <X size={16} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
        
        </>)}
      </div>

      <div className="mt-8">
        {sentRequests.length!==0 && (
        <>
        <h2 className="text-lg font-semibold mb-4">Sent Requests</h2>

        
          <div className="space-y-4">
            {sentRequests.map((req) => (
              <div key={req._id} className="card bg-base-100 shadow-md border">
                <div className="card-body flex flex-row items-center justify-between">
                  {/* USER INFO */}
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-10 rounded-full bg-base-300">
                        <img
                          src={req?.receiver?.profilePic || "avatar.png"}
                          alt={req?.receiver?.fullName}
                        />
                      </div>
                    </div>
                    <p className="font-medium">
                      {nameFormatter(req?.receiver?.fullName) || "User"}
                    </p>
                  </div>

                  <button
                    onClick={() => cancelRequest(req?.receiver?._id)}
                    className="btn btn-error btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        
        </>)}
      </div>

      <div className="mb-10 mt-5">
        <h2 className="text-lg font-semibold mb-4">Suggested Friends</h2>

        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUsers.map((user) => (
              <div key={user._id} className="card bg-base-100 shadow-md border">
                <div className="card-body flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-10 rounded-full bg-base-300">
                        <img
                          src={user.profilePic || "avatar.png"}
                          alt={user.fullName}
                        />
                      </div>
                    </div>
                    <p className="font-medium">
                      {nameFormatter(user.fullName)}
                    </p>
                  </div>

                  {!(friends || []).includes(user._id) && (
                    <button
                      onClick={() => sendFriendRequest(user._id)}
                      className="btn btn-primary btn-sm"
                    >
                      <UserPlus size={16} /> Add
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
