import mongoose, { Document, model, Schema } from 'mongoose';

export interface PostTargetComment {
  type: "blog";
  _id: mongoose.Types.ObjectId;
}

export interface PageTargetComment {
  type: "article";
  _id: mongoose.Types.ObjectId;
}

export interface CommentTargetComment {
  type: "comment";
  _id: mongoose.Types.ObjectId;
}

export interface AuthenticatedAuthor {
  type: "authenticated";
  account: mongoose.Types.ObjectId;
}

export interface AnonymousAuthor {
  type: "anonymous";
  name: string
}

export interface CommentsDTO {
  _id: mongoose.Types.ObjectId;
  parent?: PostTargetComment | PageTargetComment | CommentTargetComment;
  author?: AuthenticatedAuthor | AnonymousAuthor;
  markdown?: string;
  public?: boolean
  createdAt?: Date;
  updatedAt?: Date;
}

interface CommentsDBO extends CommentsDTO, Document {
  _id: mongoose.Types.ObjectId;
}

const commentsSchema : Schema<CommentsDBO> = new Schema({
  author: {
    type: {
      type: String,
      enum: ["authenticated", "anonymous"],
      required: true,
    },
    _id: { 
      type: String, 
      required: true
    }
  },
  parent: {
    type: {
      type: String,
      enum: ["blog", "article", "comment"],
      required: true,
    },
    _id: {
      type: String,
      required: true
    }
  },
  markdown: {
    type: String,
  },
  public: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default model<CommentsDBO>("Comments", commentsSchema);