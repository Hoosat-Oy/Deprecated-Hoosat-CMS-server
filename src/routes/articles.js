import express from 'express';
import authentication from './authentication.js';
import articlesSchema from '../schemas/articlesSchema.js';

const router = express.Router();

/**
 * Articles aka blog posts.
 * /articles/               POST        - Save a new article
 * /articles/               PUT         - Update article
 * /articles/               GET         - Get all public articles
 * /articles/:id            GET         - Get article by ID
 * /group/articles/         GET         - Get all articles by group ID
 * /account/articles/       GET         - Get all articles by account ID
 * /articles/:id            DELETE      - Delete article by ID
 */



export default {
  router,
}