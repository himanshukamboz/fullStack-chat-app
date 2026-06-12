import { useState } from "react";
import { X, Users } from "lucide-react";
import { useFriendStore } from "../store/useFriendStore";

const CreateGroupModal = ({ onClose, onCreateGroup }) => {
  const { friends } = useFriendStore();
  const [groupName, setGroupName] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());

  const toggleFriend = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCreate = () => {
    if (!groupName.trim() || selectedIds.size < 1) return;
    if (typeof onCreateGroup === "function") {
      onCreateGroup({ name: groupName.trim(), members: [...selectedIds] });
    }
    onClose();
  };

  return (
    <dialog className="modal modal-open backdrop-blur-sm">
      <div className="modal-box max-w-sm p-0 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-base-300">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-primary" />
            <h3 className="font-medium text-base">Create new group</h3>
          </div>
          <button className="btn btn-ghost btn-xs btn-circle" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-4">
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs font-medium">Group name</span>
            </label>
            <input
              type="text"
              placeholder="Enter group name…"
              className="input input-bordered input-sm w-full"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div className="form-control">
            <div className="flex items-center justify-between mb-2">
              <span className="label-text text-xs font-medium">Select friends</span>
              <span className="text-xs text-primary font-medium">
                {selectedIds.size} selected
              </span>
            </div>

            <div className="flex flex-col gap-1 max-h-56 overflow-y-auto border border-base-300 rounded-lg p-1">
              {friends.length === 0 && (
                <p className="text-sm text-base-content/50 text-center py-4">
                  No friends yet
                </p>
              )}
              {friends.map((friend) => {
                const isSelected = selectedIds.has(friend._id);
                return (
                  <label
                    key={friend._id}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors
                      ${isSelected ? "bg-primary/10" : "hover:bg-base-200"}`}
                  >
                    <img
                      src={friend.profilePic || "/avatar.png"}
                      alt={friend.fullName}
                      className="size-8 rounded-full object-cover"
                    />
                    <span className="flex-1 text-sm font-medium">
                      {friend.fullName}
                    </span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-sm"
                      checked={isSelected}
                      onChange={() => toggleFriend(friend._id)}
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 pb-5">
          <button className="btn btn-sm flex-1" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary btn-sm flex-1"
            disabled={!groupName.trim() || selectedIds.size < 1}
            onClick={handleCreate}
          >
            Create group
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default CreateGroupModal;