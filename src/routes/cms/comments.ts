import mongoose from 'mongoose';
import express from 'express';
import { ErrorHandler } from '../../lib/common/ErrorHandler';
import { confirmToken } from '../../lib/access/sessions';
import { CommentResultDTO, createComment, getCommentById, getCommentGroupId, updateComment } from '../../lib/cms/comments';
import { CommentsDTO } from '../../lib/schemas/commentsSchema';
import { confirmGroupPermission, confirmPermission } from '../../lib/access/groups';

const router = express.Router();

router.post("/comments", async (req, res) => {
  try {
    let comment = req.body as CommentsDTO;
    let result = {} as CommentResultDTO;
    if (req.headers.authorization !== undefined) {
      const { session, account } = await confirmToken(req.headers.authorization);
      comment = {
        ...comment,
        public: false,
        author: {
          type: "authenticated",
          account: account._id,
        }
      };
      result = await createComment(comment);
    } else {
      result = await createComment(comment);
    }
    return res.status(200).json(result);
  } catch (error) {
    return ErrorHandler(res, error);
  }
});

router.put("/comments/", async (req, res) => {
  try {
    const comment = req.body as CommentsDTO;
    const { account } = await confirmToken(req.headers.authorization);
    if(!account) {
      return res.status(401).json({ result: "error", message: "Anonymous comments can not be modified anonymously or by the user, requires admin." });
    }
    let { group } = await getCommentGroupId(comment);
    if (group === undefined) {
      return res.status(401).json({ result: "error", message: "Could not find comment group id." });
    }
    let { permission } = await confirmGroupPermission("WRITE", group._id,  account);
    let result = {} as CommentResultDTO;
    if(permission === true || (comment.author?.type === "authenticated" && comment.author?.account === account._id)) {
      result = await updateComment(comment);
    }
    return res.status(200).json(result);
  } catch (error) {
    return ErrorHandler(res, error);
  }
});