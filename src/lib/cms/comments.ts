import mongoose from "mongoose";
import commentsSchema, { CommentTargetComment, CommentsDTO, PageTargetComment, PostTargetComment } from "../schemas/commentsSchema";
import { GroupResultDTO, getGroup } from "../access/groups";

export interface CommentResultDTO {
  result: string,
  message: string
  comment: CommentsDTO
}

export interface CommentsResultDTO {
  result: string,
  message: string
  comments: CommentsDTO[]
}

/**
 * Creates a new comment and saves it to the database.
 *
 * @async
 * @function createComment
 * @param {CommentsDTO} comment - The comment to be saved.
 * @returns {Promise<CommentResultDTO>} A promise that resolves with a `CommentResultDTO` object.
 * @throws {Error} If the comment could not be saved.
 *
 * @example
 * const comment = {
 *   _id: new mongoose.Types.ObjectId(),
 *   parent: { type: "blog", id: "12345" },
 *   author: { type: "authenticated", id: "67890" },
 *   markdown: "This is a test comment.",
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 * };
 * const result = await createComment(comment);
 * console.log(result);
 */
export const createComment = async (
  comment: CommentsDTO,
): Promise<CommentResultDTO> => {
  const savedComment = await (new commentsSchema(comment)).save();
  if(savedComment) {
    return { result: "success", message: "Comment has been saved", comment: savedComment }
  } else {
    throw new Error("Could not save comment.");
  }
}

/**
 * 
 * Update a comment in the database
 * @async
 * @function updateComment
 * @param {CommentsDTO} comment - The comment object to update
 * @returns {Promise<CommentResultDTO>} - A promise that resolves to a CommentResultDTO object containing the result of the update operation
 * @throws {Error} - If the update operation fails, an error is thrown with a message indicating the failure
 */
export const updateComment = async (
  comment: CommentsDTO,
): Promise<CommentResultDTO> => {
  const updatedComment = await commentsSchema.findByIdAndUpdate(
    comment._id,
    {
      parent: comment.parent,
      author: comment.author,
      markdown: comment.markdown,
      public: comment.public,
      updatedAt: new Date(),
    },
    { new: true },
  );
  if (updatedComment) {
    return {
      result: "success",
      message: "Comment has been updated",
      comment: updatedComment,
    };
  } else {
    throw new Error("Could not update comment.");
  }
};


export const getCommentGroupId = async (
  comment: CommentsDTO,
): Promise<GroupResultDTO> => {
  let groupId;
  let groupIdFound = false;
  if (comment.parent?.type === "blog" || comment.parent?.type === "article") {
    groupId = comment.parent?._id;
    groupIdFound = true;
  } else if (comment.parent?.type === "comment") {
    let nextId = comment.parent._id;
    while(groupIdFound === false) {
      const { result, message, comment } = await getCommentById(nextId);
      if(comment.parent?.type === "blog" || comment.parent?.type === "article") {
        groupId = comment.parent?._id;
        groupIdFound = true;
      } else if (comment.parent?.type === "comment") {
        nextId = comment.parent?._id;
      }
    }
  }
  if(groupId !== undefined) {
    const { result, message, group } = await getGroup(groupId);
    return { result: "success", message: "Comment found", group: group }
  } else {
    throw new Error("Could not find group.");
  }
}

export const getCommentById = async (
  id: mongoose.Types.ObjectId,
): Promise<CommentResultDTO> => {
  const comment = await commentsSchema.findById(id).exec();
  if(comment) {
    return { result: "success", message: "Comment found", comment: comment }
  } else {
    throw new Error("Could not find comment.")
  }
}

/**
 * 
 * Fetches public comments for a given parent.
 * @param {PostTargetComment|PageTargetComment|CommentTargetComment} parent - The parent object for which to fetch comments.
 * @returns {Promise<CommentsResultDTO>} The result object containing the success/failure status, message, and comments.
 * @throws {Error} If the comments cannot be found.
 */
export const getPublicComments = async (
  parent: PostTargetComment | PageTargetComment | CommentTargetComment, 
): Promise<CommentsResultDTO> => {
  const comments = await commentsSchema.find({ 'parent._id' : parent._id, public : true }).exec();
  if(comments) {
    return { result: "success", message: "Comments found.", comments: comments };
  } else {
    throw new Error("Could not find comments.")
  }
}

/**
 * Retrieves all comments associated with the specified parent object.
 * @param {PostTargetComment | PageTargetComment | CommentTargetComment} parent - The parent object containing the ID of the parent document to search for comments.
 * @returns {Promise<CommentsResultDTO>} A Promise that resolves with a `CommentsResultDTO` object, containing information about the success or failure of the operation and an array of `CommentsDTO` objects representing the retrieved comments.
 * @throws {Error} Throws an error if comments cannot be retrieved.
 */
export const getAllComments = async (
  parent: PostTargetComment | PageTargetComment | CommentTargetComment, 
): Promise<CommentsResultDTO> => {
  const comments = await commentsSchema.find({ 'parent._id' : parent._id }).exec();
  if(comments) {
    return { result: "success", message: "Comments found.", comments: comments };
  } else {
    throw new Error("Could not find comments.")
  }
}

/**
 * Deletes a comment by its ID.
 * @param commentId The ID of the comment to delete.
 * @returns A Promise that resolves to a `CommentResultDTO` object indicating the result of the operation.
 * @throws An error if the comment could not be deleted.
 */
export const deleteComment = async (comment: CommentsDTO): Promise<CommentResultDTO> => {
  const deletedComment = await commentsSchema.findByIdAndDelete(comment._id).exec();
  if (deletedComment) {
    return {
      result: "success",
      message: "Comment has been deleted",
      comment: deletedComment,
    };
  } else {
    throw new Error("Could not delete comment.");
  }
};