import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Camera,
  Search,
  UserPlus,
  Shield,
  LogOut,
  Users,
  Image as ImageIcon,
  Check,
  Pencil,
  ImageOff,
  Upload,
  Trash2,
  ShieldPlus,
  ShieldMinus,
} from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useGroupStore } from "../store/useGroupStore";
import toast from "react-hot-toast";
import MemberActionModal from "./MemberActionModal";

const GroupProfilePage = ({ group, onBack }) => {
  const { authUser } = useAuthStore();
  const { updateGroup } = useChatStore();
  const {
    deleteGroup,
    exitGroup,
    removeGroupMember,
    makeGroupAdmin,
    demoteGroupAdmin,
  } = useGroupStore();

  const isAdmin = group.admins?.some(
    (a) => String(a._id || a) === String(authUser._id)
  );
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || "");
  const [imagePreview, setImagePreview] = useState(null);
  const [search, setSearch] = useState("");
  const [showAllMembers, setShowAllMembers] = useState(false);

  const filteredMembers = useMemo(() => {
    const list = group.members || [];
    const filtered = search.trim()
      ? list.filter((m) =>
          m.fullName?.toLowerCase().includes(search.toLowerCase())
        )
      : list;
    return showAllMembers ? filtered : filtered.slice(0, 4);
  }, [group.members, search, showAllMembers]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      updateGroup(group._id, { image: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const saveName = () => {
    setEditingName(false);
    if (name.trim() && name.trim() !== group.name) {
      updateGroup(group._id, { name: name.trim() });
    } else {
      setName(group.name);
    }
  };

  const saveDescription = () => {
    setEditingDesc(false);
    if (description.trim() !== (group.description || "")) {
      updateGroup(group._id, { description: description.trim() });
    }
  };
  const handleRemoveImage = () => {
    setImagePreview(null);
    updateGroup(group._id, { removeImage: true });
  };

  const handleExitGroup = async () => {
    if (!window.confirm("Are you sure you want to exit this group?")) return;
    await exitGroup(group._id);
    onBack();
  };

  const handleDeleteGroup = async () => {
    if (
      !window.confirm(
        "This will permanently delete the group for everyone. Continue?"
      )
    )
      return;
    await deleteGroup(group._id);
    onBack();
  };
  const handleQuickRemove = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from the group?`)) return;
    await removeGroupMember(group._id, [memberId]); // array, matching the backend signature
  };

  const handlePromoteAdmin = async (memberId, memberName) => {
    if (!window.confirm(`Make ${memberName} an admin?`)) return;
    await makeGroupAdmin(group._id, [memberId]);
  };

  const handleDemoteAdmin = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} as admin?`)) return;
    await demoteGroupAdmin(group._id, [memberId]);
  };
  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-base-200/40">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-base-300 bg-base-100 sticky top-0 z-10">
        <button className="btn btn-ghost btn-sm btn-circle" onClick={onBack}>
          <ArrowLeft size={18} />
        </button>
        <span className="font-medium">Group Info</span>
      </div>

      <div className="flex flex-col items-center px-4 sm:px-6 py-8 max-w-2xl w-full mx-auto">
        <div className="relative">
          <div className="size-28 sm:size-32 rounded-full overflow-hidden ring-4 ring-base-100 shadow-md">
            <img
              src={imagePreview || group.groupImage || "/group.png"}
              alt={group.name}
              className="w-full h-full object-cover"
            />
          </div>

          {isAdmin && (
            <>
              {imagePreview || group.groupImage ? (
                <div className="dropdown dropdown-end absolute bottom-1 right-1">
                  <label
                    tabIndex={0}
                    className="size-9 rounded-full bg-primary text-primary-content flex items-center justify-center cursor-pointer shadow-md hover:brightness-110 transition"
                  >
                    <Camera size={16} />
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-44 mt-2"
                  >
                    <li>
                      <label
                        htmlFor="group-avatar-upload"
                        className="flex items-center gap-2"
                      >
                        <Upload size={14} />
                        Upload photo
                        <input
                          id="group-avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    </li>
                    <li>
                      <a
                        onClick={handleRemoveImage}
                        className="flex items-center gap-2 text-error"
                      >
                        <ImageOff size={14} />
                        Remove photo
                      </a>
                    </li>
                  </ul>
                </div>
              ) : (
                <label
                  htmlFor="group-avatar-upload"
                  className="absolute bottom-1 right-1 size-9 rounded-full bg-primary text-primary-content flex items-center justify-center cursor-pointer shadow-md hover:brightness-110 transition"
                >
                  <Camera size={16} />
                  <input
                    id="group-avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </>
          )}
        </div>
        {/* Name */}
        <div className="mt-4 w-full flex flex-col items-center">
          {editingName ? (
            <div className="flex items-center gap-2 w-full max-w-xs">
              <input
                type="text"
                autoFocus
                className="input input-ghost w-full text-center font-bold border-0 border-b-2 border-base-300 rounded-none focus:outline-none focus:border-primary bg-transparent px-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
              />
              <button
                className="btn btn-primary btn-sm btn-circle"
                onClick={saveName}
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <button
              className="flex items-center gap-2 text-xl sm:text-2xl font-bold group"
              onClick={() => isAdmin && setEditingName(true)}
              disabled={!isAdmin}
            >
              {group.name}
              {isAdmin && (
                <Pencil
                  size={14}
                  className="opacity-0 group-hover:opacity-50 transition-opacity"
                />
              )}
            </button>
          )}

          {/* Description */}
          {editingDesc ? (
            <div className="flex items-start gap-2 w-full max-w-md mt-2">
              <textarea
                autoFocus
                rows={2}
                className="input input-ghost w-full text-center font-bold border-0 border-b-2 border-base-300 rounded-none focus:outline-none focus:border-primary bg-transparent px-1"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a group description…"
              />
              <button
                className="btn btn-primary btn-sm btn-circle mt-1"
                onClick={saveDescription}
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <button
              className="text-sm text-base-content/60 text-center mt-2 max-w-md group flex items-start gap-1 justify-center"
              onClick={() => isAdmin && setEditingDesc(true)}
              disabled={!isAdmin}
            >
              <span>
                {group.description ||
                  (isAdmin ? "Add a group description…" : "No description")}
              </span>
              {isAdmin && (
                <Pencil
                  size={12}
                  className="opacity-0 group-hover:opacity-50 transition-opacity mt-0.5 shrink-0"
                />
              )}
            </button>
          )}
        </div>

        {/* Stat pills */}
        <div className="flex gap-3 mt-6">
          <div className="flex items-center gap-2 bg-base-100 border border-base-300 rounded-xl px-4 py-2">
            <Users size={16} className="text-primary" />
            <div className="text-sm">
              <div className="font-bold leading-tight">
                {group.members?.length || 0}
              </div>
              <div className="text-[11px] text-base-content/50 leading-tight">
                Members
              </div>
            </div>
          </div>
        </div>

        {/* Members card */}
        <div className="w-full bg-base-100 border border-base-300 rounded-2xl mt-8 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="font-bold">Members</h3>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="input input-bordered input-sm flex items-center gap-2 flex-1 sm:w-56">
                <Search size={14} className="opacity-50" />
                <input
                  type="text"
                  className="grow"
                  placeholder="Search members…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              {isAdmin && (
                <button
                  className="btn btn-primary btn-sm gap-1 whitespace-nowrap"
                  onClick={() => setShowAddMember(true)}
                >
                  <UserPlus size={14} />
                  <span className="hidden sm:inline">Add Member</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col divide-y divide-base-200">
            {filteredMembers.map((member) => {
              const memberIsAdmin = group.admins?.some(
                (a) => String(a._id || a) === String(member._id)
              );
              const isSelf = String(member._id) === String(authUser._id);

              return (
                <div key={member._id} className="flex items-center gap-3 py-3">
                  <img
                    src={member.profilePic || "/avatar.png"}
                    alt={member.fullName}
                    className="size-10 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {member.fullName}
                      {isSelf && " (You)"}
                    </div>
                    <div className="text-xs text-base-content/50">Member</div>
                  </div>
                  {memberIsAdmin && isSelf && (
                    <span className="badge badge-primary badge-sm gap-1 shrink-0">
                      <Shield size={10} /> Admin
                    </span>
                  )}

                  {isAdmin && !isSelf && (
                    <button
                      className="btn btn-ghost btn-xs btn-circle text-primary shrink-0"
                      title={memberIsAdmin ? "Remove admin" : "Make admin"}
                      onClick={() =>
                        memberIsAdmin
                          ? handleDemoteAdmin(member._id, member.fullName)
                          : handlePromoteAdmin(member._id, member.fullName)
                      }
                    >
                      {memberIsAdmin ? (
                        <ShieldMinus size={14} />
                      ) : (
                        <ShieldPlus size={14} />
                      )}
                    </button>
                  )}

                  {isAdmin && !isSelf && (
                    <button
                      className="btn btn-ghost btn-xs btn-circle text-error shrink-0"
                      title="Remove from group"
                      onClick={() =>
                        handleQuickRemove(member._id, member.fullName)
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );
            })}

            {filteredMembers.length === 0 && (
              <p className="text-sm text-base-content/50 text-center py-6">
                No members found
              </p>
            )}
          </div>

          {!showAllMembers && (group.members?.length || 0) > 4 && !search && (
            <button
              className="btn btn-ghost btn-sm w-full mt-2 text-primary"
              onClick={() => setShowAllMembers(true)}
            >
              View all {group.members.length} members
            </button>
          )}
        </div>
        {showAddMember && (
          <MemberActionModal
            mode="add"
            group={group}
            onClose={() => setShowAddMember(false)}
          />
        )}

        {/* Exit group */}
        <button
          className="btn btn-error btn-outline btn-sm gap-2 mt-8 rounded-full"
          onClick={handleExitGroup}
        >
          <LogOut size={14} />
          Exit Group
        </button>
      </div>
    </div>
  );
};

export default GroupProfilePage;
