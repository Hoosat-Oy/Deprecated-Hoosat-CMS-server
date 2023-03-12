import express from 'express';
import authentication from './authentication';

import groupsSchema from '../lib/schemas/groupsSchema';
import { confirmGroupPermission } from '../lib/Groups';
import { addMember, deleteMember, updateMember } from '../lib/Members';

/**
 * Members
 * /member/     POST    - Add member to group
 * /member/:id  PUT     - Update member in group
 * /member/:id  DELETE  - Delete member from group
 */

const router = express.Router();



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
}

