import express from 'express';
import authentication from './authentication';

import membersSchema, { MembersDTO } from '../lib/schemas/membersSchema';
import { AccountsDTO } from '../lib/schemas/accountsSchema';
import groupsSchema, { GroupsDTO } from '../lib/schemas/groupsSchema';
import { confirmGroupPermission } from '../lib/Groups';

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
 * @param {AccountsDTO} account - The account that is added to group
 * @param {GroupsDTO} group - The group that the account is added to.
 * @param {string} rights - The rights given to the member.
 * @returns {Promise<null | MembersDTO>} - A promise that resolves to null indicating whether the member was added or not.
 */
const addMember = async (
  account: AccountsDTO, 
  group: GroupsDTO,
  rights: string,
): Promise<null | MembersDTO> => {
  const foundGroup = getGroupByMember(account);
  if(foundGroup == null) {
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
  }
  return null;
};

/**
 * Updates membership of account in a group. Most likely used for changing permissions.
 * @async
 * @param {AccountsDTO} account - The account whose membership is updated in group
 * @param {GroupsDTO} group - The group that the account belongs to.
 * @param {string} rights - The rights given to the member.
 * @returns {Promise<null | MembersDTO>} - A promise that resolves to null indicating whether the member was updated or not.
 */
const updateMember = async (
  account: AccountsDTO,
  group: GroupsDTO,
  rights: string,
): Promise<null | MembersDTO> => {
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
 * @param {AccountsDTO} account - The account that is deleted from group
 * @param {GroupsDTO} group - The group that the account is deleted from.
 * @returns {Promise<null | MembersDTO>} - A promise that resolves to null indicating whether the member was deleted or not.
 */
const deleteMember = async (
  account: AccountsDTO,
  group: GroupsDTO,
): Promise<null | MembersDTO> => {
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
 * @param {GroupsDTO} group - The group which members are searched.
 * @returns {Promise<null | MembersDTO[]>} - A promise that resolves to null indicating wheter members were found or returns the members.
 */
const getMembersByGroup = async (
  group: GroupsDTO
): Promise<null | MembersDTO[]> => {
  const members = await membersSchema.find({ group: group._id }).exec();
  if(members) {
    return members;
  }
  return null;
}

/**
 * This function finds group by member.
 * @async
 * @param {AccountsDTO} account - The group which members are searched.
 * @returns {Promise<null | GroupsDTO>} - A promise that resolves to null indicating wheter members were found or returns the members.
 */
const getGroupByMember = async (
  account: AccountsDTO
): Promise<null | GroupsDTO> => {
  const group = await getGroupByMember(account);
  if(group) {
    return group;
  }
  return null;
}

/**
 * Handles HTTP POST requests for adding member to group.
 * @function
 * @async
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} The HTTP with status code and JSON object with result, message and member properties.
 * @throws {Object} The HTTP response with status code and error message.
 */
router.post("/member/", async (req, res) => {
  try {
    const authorization = await authentication.confirm(req.headers.authorization);
    if(authorization.result !== "success") {
      return res.status(401).json({ result: "error", message: "Authorization failed."});
    }
    if(authorization.account !== null) {
      const group = await groupsSchema.findOne({ _id: req.body.group }).exec();
      if(group !== null && group !== undefined) {
        let {permission} = await confirmGroupPermission("WRITE", group, authorization.account);
        if(permission !== false) {
          let { account } = await authentication.getAccount(req.body.account);
          const member = addMember(account, group, req.body.rights);
          if(member !== null && member !== undefined) {
            return res.status(200).json({ result: "success", message: "Member added to group.", member: member });
          } else {
            return res.status(500).json({result: "error", message: "Failed to add member to group." });
          }
        } else {
          return res.status(401).json({ result: "error", message: "No authorization to write to the members data." });
        }
      } else {
        return res.status(404).json({ result: "error", message: "Group could not be found." });
      }
    } else {
      return res.status(401).json({ result: "error", message: "Authorization failed." });
    }
  } catch (error) {
    return res.status(500).json({ result: "error", message: error });
  }
});

/**
 * Handles HTTP PUT requests for updating member in group.
 * @function
 * @async
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} The HTTP with status code and JSON object with result, message and member properties.
 * @throws {Object} The HTTP response with status code and error message.
 */
router.put("/member/", async (req, res) => {
  try {
    const authorization = await authentication.confirm(req.headers.authorization);
    if(authorization.result !== "success") {
      return res.status(401).json({ result: "error", message: "Authorization failed."});
    }
    if(authorization.account !== null) {
      const group = await groupsSchema.findOne({ _id: req.body.group }).exec();
      if(group !== null && group !== undefined) {
        let {permission} = await confirmGroupPermission("WRITE", group, authorization.account);
        if(permission !== false) {
          let { account } = await authentication.getAccount(req.body.account);
          const member = updateMember(account, group, req.body.rights);
          if(member !== null && member !== undefined) {
            return res.status(200).json({ result: "success", message: "Member updated in group.", member: member });
          } else {
            return res.status(500).json({result: "error", message: "Failed to update member in group." });
          }
        } else {
          return res.status(401).json({ result: "error", message: "No authorization to write to the members data." });
        }
      } else {
        return res.status(404).json({ result: "error", message: "Group could not be found." });
      }
    } else {
      return res.status(401).json({ result: "error", message: "Authorization failed." });
    }
  } catch (error) {
    return res.status(500).json({ result: "error", message: error });
  }
});

/**
 * Handles HTTP PUT requests for deleting member from group.
 * @function
 * @async
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} The HTTP with status code and JSON object with result, message and member properties.
 * @throws {Object} The HTTP response with status code and error message.
 */
router.delete("/member/", async (req, res) => {
  try {
    const authorization = await authentication.confirm(req.headers.authorization);
    if(authorization.result !== "success") {
      return res.status(401).json({ result: "error", message: "Authorization failed."});
    }
    if(authorization.account !== null) {
      const group = await groupsSchema.findOne({ _id: req.body.group }).exec();
      if(group !== null && group !== undefined) {
        let {permission} = await confirmGroupPermission("WRITE", group, authorization.account);
        if(permission !== false) {
          let { account } = await authentication.getAccount(req.body.account);
          const member = deleteMember(account, group);
          if(member !== null && member !== undefined) {
            return res.status(200).json({ result: "success", message: "Member deleted from group.", member: member });
          } else {
            return res.status(500).json({result: "error", message: "Failed to deleted member from group." });
          }
        } else {
          return res.status(401).json({ result: "error", message: "No authorization to write to the members data." });
        }
      } else {
        return res.status(404).json({ result: "error", message: "Group could not be found." });
      }
    } else {
      return res.status(401).json({ result: "error", message: "Authorization failed." });
    }
  } catch (error) {
    return res.status(500).json({ result: "error", message: error });
  }
});

export default {
  router,
  addMember,
  updateMember,
  deleteMember,
  getMembersByGroup
}

