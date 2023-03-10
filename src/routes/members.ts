import express from 'express';
import authentication from './authentication';

import membersSchema, { IMembers } from '../schemas/membersSchema';
import { IAccounts } from '../schemas/accountsSchema';
import { IGroups } from '../schemas/groupsSchema';

/**
 * Members
 * /member/     POST    - Add member to group
 * /member/:id  PUT     - Update member in group
 * /member/:id  DELETE  - Delete member from group
 */

const router = express.Router();

/**
 * Creates a new membership for account to belong to a group.
 * @async
 * @param {IAccounts} account - The account that is added to group
 * @param {IGroups} group - The group that the account is added to.
 * @param {string} rights - The rights given to the member.
 * @returns {Promise<null | IMembers>} - A promise that resolves to null indicating whether the member was added or not.
 */
const addMember = async (
  account: IAccounts, 
  group: IGroups,
  rights: string,
): Promise<null | IMembers> => {
  const member = new membersSchema({
    group: group._id,
    account: account._id,
    rights: rights,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  const savedMember = await member.save();
  if(savedMember) {
    return savedMember;
  }
  return null;
};

/**
 * Updates membership of account in a group. Most likely used for changing permissions.
 * @async
 * @param {IAccounts} account - The account whose membership is updated in group
 * @param {IGroups} group - The group that the account belongs to.
 * @param {string} rights - The rights given to the member.
 * @returns {Promise<null | IMembers>} - A promise that resolves to null indicating whether the member was updated or not.
 */
const updateMember = async (
  account: IAccounts,
  group: IGroups,
  rights: string,
): Promise<null | IMembers> => {
  const member = await membersSchema.findOneAndUpdate(
    { account: account._id, group: group._id },
    { rights: rights },
    { new: true }
  ).exec();
  if(member) {
    return member;
  }
  return null;
}

/**
 * Deletes a membership of account in a group.
 * @async
 * @param {IAccounts} account - The account that is deleted from group
 * @param {IGroups} group - The group that the account is deleted from.
 * @returns {Promise<null | IMembers>} - A promise that resolves to null indicating whether the member was deleted or not.
 */
const deleteMember = async (
  account: IAccounts,
  group: IGroups,
): Promise<null | IMembers> => {
  const member = await membersSchema.findOneAndDelete(
    { account: account._id, group: group._id}
  ).exec();
  if(member) {
    return member;
  }
  return null;
}

/**
 * This function finds memberships of a group.
 * @async
 * @param {IGroups} group - The group which members are searched.
 * @returns {Promise<null | IMembers[]>} - A promise that resolves to null indicating wheter members were found or returns the members.
 */
const getMembersByGroup = async (
  group: IGroups
): Promise<null | IMembers[]> => {
  const members = await membersSchema.find({ group: group._id }).exec();
  if(members) {
    return members;
  }
  return null;
}

export default {
  router,
  addMember,
  updateMember,
  deleteMember,
  getMembersByGroup
}