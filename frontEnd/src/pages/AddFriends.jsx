import { useState } from "react";
import { Search, UserPlus, Check, X } from "lucide-react";

const mockUsers = [
  { id: 1, name: "Alice Sharma" },
  { id: 2, name: "Rohit Kumar" },
  { id: 3, name: "Priya Singh" },
];

const mockRequests = [
  { id: 4, name: "Ankit Verma" },
  { id: 5, name: "Neha Gupta" },
];

export default function AddFriendsUI() {
  const [search, setSearch] = useState("");

  return (
    <div className="p-6 max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-6">Add Friends</h1>

      {/* Search Bar */}
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

      {/* Friend Requests */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Friend Requests</h2>

        <div className="space-y-4">
          {mockRequests.map((req) => (
            <div key={req.id} className="card bg-base-100 shadow-md border">
              <div className="card-body flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-10 rounded-full bg-base-300"></div>
                  </div>
                  <p className="font-medium">{req.name}</p>
                </div>

                <div className="flex gap-2">
                  <button className="btn btn-success btn-sm">
                    <Check size={16} /> Accept
                  </button>
                  <button className="btn btn-error btn-sm">
                    <X size={16} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

       {/* Suggested Friends */}
       <div className="mb-10 mt-5">
        <h2 className="text-lg font-semibold mb-4">Suggested Friends</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockUsers.map((user) => (
            <div key={user.id} className="card bg-base-100 shadow-md border">
              <div className="card-body flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-10 rounded-full bg-base-300"></div>
                  </div>
                  <p className="font-medium">{user.name}</p>
                </div>

                <button className="btn btn-primary btn-sm">
                  <UserPlus size={16} /> Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
