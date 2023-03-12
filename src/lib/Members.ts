import { getGroupByMember } from "./Groups";
import { AccountsDTO } from "./schemas/accountsSchema";
import { GroupsDTO } from "./schemas/groupsSchema";
import membersSchema, { MembersDTO } from "./schemas/membersSchema";

interface MemberResultDTO {
  result: string,
  message: string,
  member: MembersDTO
}

interface MembersResultDTO {
  result: string,
  message: string,
  members: MembersDTO[]
}
/**
 * Adds a member to the specified group with the given rights.
 * @function
 * @async
 * @param {AccountsDTO} account - The account to add as a member.
 * @param {GroupsDTO} group - The group to add the account as a member to.
 * @param {string} rights - The rights of the member in the group.
 * @returns {Promise<MemberResultDTO>} A promise that resolves with the added member and a success message.
 * @throws {Error} If the member is already in a group.
 */
const addMember = async (
  account: AccountsDTO, 
  group: GroupsDTO,
  rights: string,
): Promise<MemberResultDTO> => {
  const foundGroup = getGroupByMember(account);
  if(foundGroup !== null) {
    throw new Error("Member already in a group.");
  }
  const member = new membersSchema({
    group: group._id,
    account: account._id,
    rights: rights,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  const savedMember = await member.save();
  return {
    result: "success",
    message: "Member added to group",
    member: savedMember,
  }
};
/**
 * Updates the rights of a member in the specified group.
 * @function
 * @async
 * @param {AccountsDTO} account - The account to update the rights of.
 * @param {GroupsDTO} group - The group the account is a member of.
 * @param {string} rights - The updated rights of the member in the group.
 * @returns {Promise<MemberResultDTO>} A promise that resolves with the updated member and a success message.
 * @throws {Error} If the member could not be updated.
 */
const updateMember = async (
  account: AccountsDTO,
  group: GroupsDTO,
  rights: string,
): Promise<MemberResultDTO> => {
  const member = await membersSchema.findOneAndUpdate(
    { account: account._id, group: group._id },
    { rights: rights },
    { new: true }
  ).exec();
  if(member === null) {
    throw new Error("Member could not be updated.");
  }
  return {
    result: "success",
    message: "Member updated in group",
    member: member,
  }
}

/**
 * Deletes a member from a group.
 * @function
 * @async
 * @param {AccountsDTO} account - The account to remove from the group.
 * @param {GroupsDTO} group - The group to remove the account from.
 * @returns {Promise<MemberResultDTO>} The member result object.
 * @throws {Error} Throws an error if the member could not be deleted.
 */
const deleteMember = async (
  account: AccountsDTO,
  group: GroupsDTO,
): Promise<MemberResultDTO> => {
  const member = await membersSchema.findOneAndDelete(
    { account: account._id, group: group._id}
  ).exec();
  if(member === null) {
    throw new Error("Member could not be deleted.");
  }
  return {
    result: "success",
    message: "Member deleted from group",
    member: member,
  }
}

/**
 * Gets all members for a group.
 * @function
 * @async
 * @param {GroupsDTO} group - The group to get members for.
 * @returns {Promise<MembersResultDTO>} The members result object.
 * @throws {Error} Throws an error if members could not be found.
 */
const getMembersByGroup = async (
  group: GroupsDTO
): Promise<MembersResultDTO> => {
  const members = await membersSchema.find({ group: group._id }).exec();
  if(members === null) {
    throw new Error("Members could not be found.");
  }
  return {
    result: "success",
    message: "Member deleted from group",
    members: members,
  }
}

export {
  addMember,
  updateMember,
  deleteMember,
  getMembersByGroup
}