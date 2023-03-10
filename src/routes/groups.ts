import express from 'express';
import authentication from './authentication.js';

import groupsSchema, { IGroup } from '../schemas/groupsSchema';
import membersSchema from '../schemas/membersSchema.js';
import accountsSchema, { IAccount } from '../schemas/accountsSchema.js';

/**
 * Group and it's members.
 * /group/      POST    - Create group
 * /group/      PUT     - Update group
 * /groups/     GET     - Get groups
 * /group/:id   GET     - Get group by id
 * /group/:id   DELETE  - Delete group by id
 */

const router = express.Router();

/**
 * Checks if a member of a group has a specific permission.
 * @async
 * @param {string} permission - The permission to check.
 * @param {IGroup} group - The group to check membership in.
 * @param {IAccount} member - The member to check for permission.
 * @returns {Promise<boolean>} A Promise that resolves to a boolean indicating whether the member has the permission.
 */
const checkGroupPermission = async (permission: string, group: IGroup, member: IAccount): Promise<boolean> => {
  const foundMember = await membersSchema.findOne({
    group: group._id,
    account: member._id,
  }).exec();
  if (foundMember && foundMember.rights.includes(permission)) {
    return true;
  }
  return false;
};

/**
 * Creates a new group and adds a member with read, write, and delete rights to the group.
 * @async
 * @param {IGroup} group - The group to create.
 * @param {IAccount} member - The member to add to the group.
 * @returns {Promise<object>} A Promise that resolves to an object representing the created group, including the added member.
 */
const createGroup = async (
  group: IGroup, 
  member: IAccount
): Promise<object> => {
  group = new groupsSchema(group);
  group = await group.save();
  const addedMember = new membersSchema({
    group: group._id,
    account: member._id,
    rights: "READ | WRITE | DELETE",
  });
  const savedMember = await addedMember.save();
  return {
    ...group,
    members: [{
      ...savedMember
    }]
  }
}

/**
 * POST endpoint for creating a new group.
 * @function
 * @async
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} The response object with the status and result.
 * @throws {object} The response object with an error message if the request fails.
 */
router.post("/group/", async (req, res) => {
  try {
    let authorization = await authentication.confirm(req.headers.authorization);
    if(authorization.result !== "success") {
      return res.status(401).json({ result: "error", message: "Authorization failed." });
    }
    if(authorization.account !== null) {
      const result = await createGroup(req.body.group, authorization.account);
      if(result !== null && result !== undefined) {
        return res.status(201).json({ result: "success", message: "Group created", group: result });
      } else {
        return res.status(400).json({ result: "error", message: "Group creation failed." });
      }
    }
  } catch  (error) {
    return res.status(500).json({ result: "error", message: error });
  }
});

/**
 * Updates a group's information.
 * @async
 * @function
 * @param {IGroup} group - The group to update.
 * @param {IAccount} member - The member updating the group.
 * @returns {Promise<IGroup|null>} Returns the updated group, or null if the member does not have permission.
 */
const updateGroup = async (
  group: IGroup, 
  member: IAccount
): Promise<IGroup|null> => {
  let permission = await checkGroupPermission("WRITE", group._id, member._id);
  if(permission == false) {
    return null;
  }
  return await groupsSchema.findOneAndUpdate({ _id: group._id }, group, { new: true }).exec();
}

/**
 * Updates a group if the member has WRITE permission.
 * @function
 * @async
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.headers.authorization - The authorization header.
 * @param {Object} req.body.group - The group to update.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} - The HTTP response.
 * @throws Will throw an error if authorization fails, if the member does not have WRITE permission, or if the update fails.
 *
 * @example
 * // Returns an array of all groups
 * PUT /group/
 */
router.put("/group/", async (req, res) => {
  try {
    let authorization = await authentication.confirm(req.headers.authorization);
    if(authorization.result !== "success") {
      return res.status(401).json({ result: "error", message: "Authorization failed."});
    }
    if(authorization.account !== null) {
      const result = await updateGroup(req.body.group, authorization.account);
      if(result !== null && result !== undefined) {
        return res.status(201).json({ result: "success", message: "Group updated", group: result });
      } else {
        return res.status(400).json({ result: "error", message: "Group update failed." });
      }
    }
  } catch (error) {
    return res.status(500).json({ result: "error", message: error });
  }
});

/**
 * Retrieves all groups from the database
 * @returns {Promise<IGroup[] | null>} - A promise that resolves to an array of groups
 */
const getGroups = async (): Promise<IGroup[] | null> => {
  const groups = await groupsSchema.find({}).exec();
  return groups;
}

/**
 * Retrieves a single group with the given id from the database
 * @param {string} id - The id of the group to retrieve
 * @returns {Promise<IGroup | null>} - A promise that resolves to the group with the given id, or null if not found
 */
const getGroup = async (id: string): Promise<IGroup | null> =>  {
  const groups = await groupsSchema.findOne({ _id: id}).exec();
  return groups;
}

/**
 * Retrieves all groups.
 *
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Promise object that represents the completion of the request.
 * @throws {Error} - Throws an error if there is a server error.
 *
 * @example
 * // Returns an array of all groups
 * GET /groups/
 */
router.get("/groups/", async (req, res) => {
  try {
    let authorization = await authentication.confirm(req.headers.authorization);
    if(authorization.result !== "success") {
      return res.status(401).json({ result: "error", message: "Authorization failed."});
    }
    let result = await getGroups();
    if(result !== null && result !== undefined) {
      return res.status(201).json({ result: "success", message: "Groups found", groups: result });
    } else {
      return res.status(400).json({ result: "error", message: "Groups not found." });
    }
  } catch (error) {
    return res.status(500).json({ result: "error", message: error });
  }
});

/**
 * Express route handler for getting a group by ID.
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Parameters extracted from the URL path.
 * @param {string} req.params.id - ID of the group to get.
 * @param {Object} req.headers.authorization - Authorization token in the request headers.
 * @param {Object} res - Express response object.
 * @returns {Promise<Object>} A promise that resolves to an object representing the HTTP response.
 * @throws Will throw an error if there is an unexpected server-side issue.
 */
router.get("/group/:id", async (req, res) => {
  try {
    let authorization = await authentication.confirm(req.headers.authorization);
    if(authorization.result !== "success") {
      return res.status(401).json({ result: "error", message: "Authorization failed."});
    }
    let result = await getGroup(req.params.id);
    if(result !== null && result !== undefined) {
      return res.status(201).json({ result: "success", message: "Groups found", groups: result });
    } else {
      return res.status(400).json({ result: "error", message: "Groups not found." });
    }
  } catch (error) {
    return res.status(500).json({ result: "error", message: error });
  }
});

/**
 * Deletes the specified group from the database if the authenticated account has permission to do so.
 * @param {IGroup} group - The group to be deleted.
 * @param {IAccount} account - The authenticated account.
 * @returns {Promise<IGroup|null>} Returns the deleted group if successful, or null if the authenticated account does not have permission to delete the group.
 */
const deleteGroup = async (
  group: IGroup,
  account: IAccount
) => {
  let permission = await checkGroupPermission("DELETE", group, account._id);
  if(permission == false) {
    return null;
  }
  return await groupsSchema.findOneAndDelete({ _id: group}).exec();
}
/**
 * Handles HTTP DELETE requests for deleting a group with the specified ID.
 * @function
 * @async
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} The HTTP response with status code and JSON object with result, message and groups properties.
 * @throws {Object} The HTTP response with status code and error message.
 */
router.delete("/group/:id", async (req, res) => {
  try {
    const authorization = await authentication.confirm(req.headers.authorization);
    if(authorization.result !== "success") {
      return res.status(401).json({ result: "error", message: "Authorization failed."});
    }
    if(authorization.account !== null) {
      const group = await getGroup(req.params.id);
      if(group !== null && group !== undefined) {
        const result = await deleteGroup(group, authorization.account);
        if(result !== null && result !== undefined) {
          return res.status(201).json({ result: "success", message: "Groups found", groups: result });
        } else {
          return res.status(400).json({ result: "error", message: "Groups not found." });
        }
      }
    }
    
  } catch (error) {
    return res.status(500).json({ result: "error", message: error });
  }
});

export {
  router,
  createGroup,
  updateGroup,
  getGroups,
  getGroup,
  deleteGroup,
}

