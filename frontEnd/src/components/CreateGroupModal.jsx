import { useState, useEffect, useRef } from "react";
import { X, Users, Camera } from "lucide-react";
import { useFriendStore } from "../store/useFriendStore";
import toast from "react-hot-toast";

const CreateGroupModal = ({ onClose, onCreateGroup }) => {
  const { friends, getAllFriends } = useFriendStore(); 
  const [groupName, setGroupName] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getAllFriends();
  }, []);

  const toggleFriend = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCreate = () => {
    if (!groupName.trim() || selectedIds.size < 1) return;
    if (typeof onCreateGroup === "function") {
      onCreateGroup({
        name: groupName.trim(),
        members: [...selectedIds],
        image: imagePreview,
      });
    }
    onClose();
  };

  return (
    <dialog className="modal modal-open backdrop-blur-sm">
      <div className="modal-box max-w-md p-0 overflow-hidden">
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
          {/* Group image picker */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="size-20 rounded-full overflow-hidden bg-base-200 flex items-center justify-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Group"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users size={28} className="text-base-content/40" />
                )}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 size-7 rounded-full bg-primary text-primary-content flex items-center justify-center"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={13} />
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

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
              <span className="label-text text-xs font-medium">
                Select friends
              </span>
              <span className="text-xs text-primary font-medium">
                {selectedIds.size} selected
              </span>
            </div>

            {/* was max-h-56, now taller so ~4 rows show before scrolling */}
            <div className="flex flex-col gap-1 max-h-80 overflow-y-auto border border-base-300 rounded-lg p-1">
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
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors shrink-0
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
