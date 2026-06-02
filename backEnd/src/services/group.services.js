import Group from '../models/group.model.js'
export const createGroupService = async (name, members, creatorId) => {
    const group = await Group.create({
      name,
      members: [...members, creatorId],
      admins: [creatorId], 
    });
  
    return group;
  };

  export const getUserGroupsService = async (userId) => {
    return await Group.find({
      members: userId,
    }).populate("members", "fullName profilePic");
  };
  
  export const addMembersService = async (groupId, newMembers, userId) => {
    const group = await Group.findById(groupId);
    if (!group) throw new Error("Group not found");
  
    const isAdmin = group.admins.some(
      (admin) => admin.toString() === userId.toString()
    );
  
    if (!isAdmin) {
      throw new Error("Only admins can add members");
    }
  
    group.members.push(...newMembers);
    group.members = [...new Set(group.members.map(id => id.toString()))];
    await group.save();
  
    return group;
  };

  export const makeAdminService = async (groupId, memberId, userId) => {
    const group = await Group.findById(groupId);
  
    const isAdmin = group.admins.some(
      (admin) => admin.toString() === userId.toString()
    );
  
    if (!isAdmin) throw new Error("Only admins can assign admin");
  
    if (!group.members.includes(memberId)) {
      throw new Error("User is not a group member");
    }
  
    if (!group.admins.includes(memberId)) {
      group.admins.push(memberId);
    }
  
    await group.save();
  
    return group;
  };

  export const removeAdminService = async (groupId, memberId, userId) => {
    const group = await Group.findById(groupId);
  
    const isAdmin = group.admins.some(
      (admin) => admin.toString() === userId.toString()
    );
  
    if (!isAdmin) throw new Error("Only admins can remove admin");
  
    group.admins = group.admins.filter(
      (id) => id.toString() !== memberId.toString()
    );
  
    if (group.admins.length === 0) {
      throw new Error("Group must have at least one admin");
    }
  
    await group.save();
  
    return group;
  };

  export const removeMemberService = async (groupId, memberId, userId) => {
    const group = await Group.findById(groupId);
  
    if (!group) {
      throw new Error("Group not found");
    }
  
    const isAdmin = group.admins.some(
      (admin) => admin.toString() === userId.toString()
    );
  
    if (!isAdmin) {
      throw new Error("Only admins can remove members");
    }
    const isMember = group.members.some(
      (id) => id.toString() === memberId.toString()
    );
  
    if (!isMember) {
      throw new Error("User is not a group member");
    }
  
    if (memberId.toString() === userId.toString()) {
      throw new Error("You cannot remove yourself. Use leave group instead");
    }
  
    group.members = group.members.filter(
      (id) => id.toString() !== memberId.toString()
    );
  
    group.admins = group.admins.filter(
      (id) => id.toString() !== memberId.toString()
    );
  
    if (group.admins.length === 0) {
      throw new Error("Group must have at least one admin");
    }
  
    await group.save();
  
    return group;
  };

  export const leaveGroupService = async (groupId, userId) => {
    const group = await Group.findById(groupId);
  
    group.members = group.members.filter(
      (id) => id.toString() !== userId.toString()
    );
  
    group.admins = group.admins.filter(
      (id) => id.toString() !== userId.toString()
    );
  
    if (group.admins.length === 0 && group.members.length > 0) {
      group.admins.push(group.members[0]); 
    }
    await group.save();
    return group;
  };