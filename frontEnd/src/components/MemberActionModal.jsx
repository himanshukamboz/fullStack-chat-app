import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import { useGroupStore } from "../store/useGroupStore";

/**
 * mode: "add" | "remove" | "makeAdmin"
 * - "add"       → lists friends NOT already in the group, calls addGroupMember
 * - "remove"    → lists current members (excluding yourself), calls removeGroupMember
 * - "makeAdmin" → lists current members who are NOT already admins, calls makeGroupAdmin
 */
const MemberActionModal = ({ group, mode, onClose }) => {
  const { authUser } = useAuthStore();
  const { friends, getAllFriends } = useFriendStore();
  const { addGroupMember, removeGroupMember, makeGroupAdmin } = useGroupStore();

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdd = mode === "add";
  const isRemove = mode === "remove";
  const isMakeAdmin = mode === "makeAdmin";

  useEffect(() => {
    if (isAdd) getAllFriends();
  }, [isAdd]);

  const currentMemberIds = new Set((group.members || []).map((m) => String(m._id)));
  const currentAdminIds = new Set((group.admins || []).map((a) => String(a._id || a)));

  const candidates = isAdd
    ? friends.filter((f) => !currentMemberIds.has(String(f._id)))
    : isRemove
    ? (group.members || []).filter((m) => String(m._id) !== String(authUser._id))
    : (group.members || []).filter((m) => !currentAdminIds.has(String(m._id))); // makeAdmin

  const toggleId = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selectedIds.size === 0) return;
    setIsSubmitting(true);
    const ids = [...selectedIds];

    if (isAdd) await addGroupMember(group._id, ids);
    else if (isRemove) await removeGroupMember(group._id, ids);
    else await makeGroupAdmin(group._id, ids);

    setIsSubmitting(false);
    onClose();
  };

  const copy = isAdd
    ? {
        title: "Add members",
        label: "Select friends to add",
        empty: "All your friends are already in this group",
        submitVerb: "Add",
      }
    : isRemove
    ? {
        title: "Remove members",
        label: "Select members to remove",
        empty: "No other members to remove",
        submitVerb: "Remove",
      }
    : {
        title: "Make admin",
        label: "Select members to promote",
        empty: "Everyone is already an admin",
        submitVerb: "Promote",
      };

  const accentClasses = isRemove
    ? {
        selectedCount: "text-xs text-error font-medium",
        rowSelected: "bg-error/10",
        checkbox: "checkbox checkbox-error checkbox-sm",
        submitBtn: "btn btn-error btn-sm flex-1",
      }
    : {
        selectedCount: "text-xs text-primary font-medium",
        rowSelected: "bg-primary/10",
        checkbox: "checkbox checkbox-primary checkbox-sm",
        submitBtn: "btn btn-primary btn-sm flex-1",
      };

  return (
    <dialog className="modal modal-open backdrop-blur-sm">
      <div className="modal-box max-w-sm p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-base-300">
          <h3 className="font-medium text-base">{copy.title}</h3>
          <button className="btn btn-ghost btn-xs btn-circle" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-base-content/60">{copy.label}</span>
            <span className={accentClasses.selectedCount}>{selectedIds.size} selected</span>
          </div>

          <div className="flex flex-col gap-1 max-h-72 overflow-y-auto border border-base-300 rounded-lg p-1">
            {candidates.length === 0 && (
              <p className="text-sm text-base-content/50 text-center py-4">{copy.empty}</p>
            )}
            {candidates.map((person) => {
              const isSelected = selectedIds.has(person._id);
              const isPersonAdmin =
                !isAdd && currentAdminIds.has(String(person._id));

              return (
                <label
                  key={person._id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors
                    ${isSelected ? accentClasses.rowSelected : "hover:bg-base-200"}`}
                >
                  <img
                    src={person.profilePic || "/avatar.png"}
                    alt={person.fullName}
                    className="size-8 rounded-full object-cover"
                  />
                  <span className="flex-1 text-sm font-medium">
                    {person.fullName}
                    {isPersonAdmin && (
                      <span className="text-xs text-base-content/40 ml-1">(Admin)</span>
                    )}
                  </span>
                  <input
                    type="checkbox"
                    className={accentClasses.checkbox}
                    checked={isSelected}
                    onChange={() => toggleId(person._id)}
                  />
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2 px-5 pb-5">
          <button className="btn btn-sm flex-1" onClick={onClose}>
            Cancel
          </button>
          <button
            className={accentClasses.submitBtn}
            disabled={selectedIds.size === 0 || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              `${copy.submitVerb} ${selectedIds.size > 0 ? `(${selectedIds.size})` : ""}`
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default MemberActionModal;