import authentication from "../routes/authentication";
import { AccountsDTO } from "./schemas/accountsSchema";
import groupsSchema, { GroupsDTO } from "./schemas/groupsSchema";
import membersSchema, { MembersDTO } from "./schemas/membersSchema";

interface confirmGroupResultDTO {
  result: string;
  message: string;
  permission: boolean;
  group: GroupsDTO;
  account: AccountsDTO;
}

interface GroupResultDTO {
  result: string;
  message: string;
  group: GroupsDTO;
  members?: MembersDTO[];
}

interface GroupsResultDTO {
  result: string;
  message: string;
  groups: GroupsDTO[];
  members?: MembersDTO[];
}

/**
 * Checks if a member of a group has a specific permission.
 * @async
 * @param {string} permission - The permission to check.
 * @param {GroupsDTO} group - The group to check membership in.
 * @param {AccountsDTO} member - The member to check for permission.
 * @returns {Promise<confirmGroupResultDTO>} A Promise that resolves to a boolean indicating whether the member has the permission.
 */
const confirmGroupPermission = async (permission: string, group: GroupsDTO, member: AccountsDTO): Promise<confirmGroupResultDTO> => {
  const foundMember = await membersSchema.findOne({
    group: group._id,
    account: member._id,
  }).exec();
  if (foundMember && foundMember.rights?.includes(permission)) {
    return { result: "success", message: "Permission confirmed", group: group, account: member, permission: true };
  } else {
    throw new Error("Could not confirm group permission.");
  }
};

/**
 * Creates a new group and adds a member with read, write, and delete rights to the group.
 * @async
 * @param {GroupsDTO} group - The group to create.
 * @param {AccountsDTO} member - The member to add to the group.
 * @returns {Promise<GroupResultDTO>} A Promise that resolves to an GroupResultDTO representing the created group, including the added member.
 */
const createGroup = async (
  group: GroupsDTO, 
  member: AccountsDTO
): Promise<GroupResultDTO> => {
  let dbGroup = new groupsSchema(group);
  dbGroup = await dbGroup.save();
  const addedMember = new membersSchema({
    group: dbGroup._id,
    account: member._id,
    rights: "READ | WRITE | DELETE",
  });
  const savedMember = await addedMember.save();
  return {
    result: "success",
    message: "Created group and added creator as member with full rights.",
    group: dbGroup,
    members: [savedMember]
  }
}

/**
 * Updates a group's information.
 * @async
 * @function
 * @param {GroupsDTO} group - The group to update.
 * @param {AccountsDTO} member - The member updating the group.
 * @returns {Promise<GroupResultDTO>} Returns the updated group, or null if the member does not have permission.
 */
const updateGroup = async (
  group: GroupsDTO, 
  member: AccountsDTO
): Promise<GroupResultDTO> => {
  let { permission } = await confirmGroupPermission("WRITE", group, member);
  const updatedGroup = await groupsSchema.findOneAndUpdate({ _id: group._id }, group, { new: true }).exec();
  if(updatedGroup === null) {
    throw new Error("Could not update group.");
  }
  return {
    result: "success",
    message: "Updated group.",
    group: updatedGroup,
  };
}

/**
 * Retrieves all groups from the database
 * @returns {Promise<GroupsResultDTO>} - A promise that resolves to an array of groups
 */
const getGroups = async (): Promise<GroupsResultDTO> => {
  const groups = await groupsSchema.find({}).exec();
  if(groups === null) {
    throw new Error("Could not update group.");
  }
  return {
    result: "success",
    message: "Found groups",
    groups: groups,
  };
}

/**
 * Retrieves a single group with the given id from the database
 * @param {string} id - The id of the group to retrieve
 * @returns {Promise<GroupResultDTO>} - A promise that resolves to the group with the given id, or null if not found
 */
const getGroup = async (id: string): Promise<GroupResultDTO> =>  {
  const group = await groupsSchema.findOne({ _id: id}).exec();
  if(group === null) {
    throw new Error("Could not update group.");
  }
  return {
    result: "success",
    message: "Found groups",
    group: group,
  };
}

/**
 * Retrieves a single group with the given account membership from the database
 * @param {AccountsDTO} account - The id of the group to retrieve
 * @returns {Promise<GroupResultDTO>} - A promise that resolves to the group with the given id, or null if not found
 */
const getGroupByMember = async (
  account: AccountsDTO
): Promise<GroupResultDTO> =>  {
  const member = await membersSchema.findOne({ account: account._id }).exec();
  if(member == null) {
    throw new Error("Could not find membership.");
  }
  const group = await groupsSchema.findOne({ _id: member.group }).exec();
  if(group === null) {
    throw new Error("Could not update group.");
  }
  return {
    result: "success",
    message: "Found groups",
    group: group,
  };
}

/**
 * Deletes the specified group from the database if the authenticated account has permission to do so.
 * @param {GroupsDTO} group - The group to be deleted.
 * @param {AccountsDTO} account - The authenticated account.
 * @returns {Promise<GroupResultDTO>} Returns the deleted group if successful, or null if the authenticated account does not have permission to delete the group.
 */
const deleteGroup = async (
  group: GroupsDTO,
  account: AccountsDTO
): Promise<GroupResultDTO> => {
  let {permission} = await confirmGroupPermission("DELETE", group, account);
  if(permission == false) {
    throw new Error("No permission to DELTE group");
  }
  const deletedGroup = await groupsSchema.findOneAndDelete({ _id: group}).exec();
  if(deletedGroup === null) {
    throw new Error("Could not update group.");
  }
  return {
    result: "success",
    message: "Deleted group",
    group: deletedGroup,
  };
}

/**
 * Get account and group and do checking if authorization and group permissions are what they are required to be.
 * @function
 * @async
 * @param {string | undefined} token - The session token of the account.
 * @param {stirng} permission - The permission required for the account in the group.
 * @returns {Promise<CheckAuthorizationAndGroupPermissionResult>} - A promise that resolves to null or the article.
 */

const confirmPermission = async (
  account: AccountsDTO,
  perm: string,
) => {
  const {group} = await getGroupByMember(account);
  if(group === null) {
    throw new Error("Could not find group.");
  }
  const {permission} = await confirmGroupPermission(perm, group, account);
  if(permission === false) {
    throw new Error(`No ${permission} for the account in the group.`);
  }
  return { result: "success", message: "Permission was confirmed.", permission: permission, group: group }
}


export {
  confirmGroupPermission,
  confirmPermission,
  createGroup,
  updateGroup,
  getGroups,
  getGroup,
  deleteGroup,
  getGroupByMember
}
