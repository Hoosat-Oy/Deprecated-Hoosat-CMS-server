import mongoose from 'mongoose';
import express from 'express';
import { 
  confirmGroupPermission, 
  confirmPermission 
} from '../../lib/access/groups';
import { 
  createArticle, 
  deleteArticle, 
  getArticle, 
  getArticlesByDomain, 
  getArticlesByGroup, 
  getPublicArticles, 
  getPublicArticlesByDomain, 
  publishArticle, 
  unpublishArticle, 
  updateArticle 
} from '../../lib/cms/articles';
import { confirmToken } from '../../lib/access/sessions';
import { ErrorHandler } from '../../lib/common/ErrorHandler';


const router = express.Router();

/**
 * Articles aka blog posts.
 * /articles/               POST        - Save a new article
 * /articles/               PUT         - Update article
 * /articles/               GET         - Get all public articles
 * /articles/:id            GET         - Get article by ID
 * /articles/group/:id      GET         - Get all articles by group ID
 * /articles/domain/:id     GET         - Get all articles by domain
 * /articles/:id            DELETE      - Delete article by ID
 */

/**
 * Handles HTTP POST requests for adding article.
 * @function
 * @async
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} The HTTP with status code and JSON object with result, message and article properties.
 * @throws {Object} The HTTP response with status code and error message.
 */
router.post("/articles/", async (req, res) => {
  try {
    const { session, account } = await confirmToken(req.headers.authorization);
    const { permission, group } = await confirmPermission(account, "WRITE");
    return res.status(200).json(await createArticle(account, group, req.body.article));
  } catch (error) {
    return ErrorHandler(res, error);
  }
});

/**
 * Handles HTTP Put requests for updating article.
 * @function
 * @async
 * @param {object} req - The HTTP rquest object.
 * @param {object} res - The HTTP response object.
 * @returns {Object} The HTTP with status code and JSON object with result, message and article properties.
 * @throws {Object} The HTTP response with status code and error message.
 */
router.put("/articles/", async (req, res) => {
  try {
    const { session, account } = await confirmToken(req.headers.authorization);
    const { permission, group } = await confirmPermission(account, "WRITE");
    return res.status(200).json(await updateArticle(req.body.article));
  } catch (error) {
    return ErrorHandler(res, error);
  }
});

/**
 * Handles HTTP Put requests for publishing article.
 * @function
 * @async
 * @param {object} req - The HTTP rquest object.
 * @param {object} res - The HTTP response object.
 * @returns {Object} The HTTP with status code and JSON object with result, message and article properties.
 * @throws {Object} The HTTP response with status code and error message.
 */
router.put("/articles/publish", async (req, res) => {
  try {
    const { session, account } = await confirmToken(req.headers.authorization);
    const { permission, group } = await confirmPermission(account, "WRITE");
    return res.status(200).json(await publishArticle(req.body.article));
  } catch (error) {
    return ErrorHandler(res, error);
  }
});

/**
 * Handles HTTP Put requests for unpublishing article.
 * @function
 * @async
 * @param {object} req - The HTTP rquest object.
 * @param {object} res - The HTTP response object.
 * @returns {Object} The HTTP with status code and JSON object with result, message and article properties.
 * @throws {Object} The HTTP response with status code and error message.
 */
router.put("/articles/unpublish", async (req, res) => {
  try {
    const { session, account } = await confirmToken(req.headers.authorization);
    const { permission, group } = await confirmPermission(account, "WRITE");
    return res.status(200).json(await unpublishArticle(req.body.article));
  } catch (error) {
    return ErrorHandler(res, error);
  }
});

/**
 * Handles HTTP delete requests for updating article.
 * @function
 * @async
 * @param {object} req - The HTTP rquest object.
 * @param {object} res - The HTTP response object.
 * @returns {Object} The HTTP with status code and JSON object with result, message and article properties.
 * @throws {Object} The HTTP response with status code and error message.
 */
router.delete("/articles/:id", async (req, res) => {
  try {
    const { session, account } = await confirmToken(req.headers.authorization);
    const { permission, group } = await confirmPermission(account, "DELETE");
    return res.status(200).json(await deleteArticle(req.params.id));
  } catch (error) {
    return ErrorHandler(res, error);
  }
});

/**
 * Handles HTTP Get requests for getting article.
 * @function
 * @async
 * @param {object} req - The HTTP rquest object.
 * @param {object} res - The HTTP response object.
 * @returns {Object} The HTTP with status code and JSON object with result, message and article properties.
 * @throws {Object} The HTTP response with status code and error message.
 */
router.get("/articles/", async (req, res) => {
  try {
    return res.status(200).json(await getPublicArticles());
  } catch (error) {
    return ErrorHandler(res, error);
  }
});

/**
 * Handles HTTP Get requests for getting article.
 * @function
 * @async
 * @param {object} req - The HTTP rquest object.
 * @param {object} res - The HTTP response object.
 * @returns {Object} The HTTP with status code and JSON object with result, message and article properties.
 * @throws {Object} The HTTP response with status code and error message.
 */
router.get("/article/:id", async (req, res) => {
  try {
    return res.status(200).json(await getArticle(req.params.id));
  } catch (error) {
    return ErrorHandler(res, error);
  }
});

/**
 * Handles HTTP Get requests for getting article by group id.
 * @function
 * @async
 * @param {object} req - The HTTP rquest object.
 * @param {object} res - The HTTP response object.
 * @returns {Object} The HTTP with status code and JSON object with result, message and article properties.
 * @throws {Object} The HTTP response with status code and error message.
 */
router.get("/articles/group/:id", async (req, res) => {
  try {
    const { session, account } = await confirmToken(req.headers.authorization);
    const groupId = new mongoose.Types.ObjectId(req.params.id);
    const { permission, group } = await confirmGroupPermission("READ", { _id : groupId },  account);
    return res.status(200).json(await getArticlesByGroup(group));
  } catch (error) {
    return ErrorHandler(res, error);
  }
});

/**
 * Handles HTTP Get requests for getting article.
 * @function
 * @async
 * @param {object} req - The HTTP rquest object.
 * @param {object} res - The HTTP response object.
 * @returns {Object} The HTTP with status code and JSON object with result, message and article properties.
 * @throws {Object} The HTTP response with status code and error message.
 */
router.get("/articles/domain/:id", async (req, res) => {
  try {
    return res.status(200).json(await getArticlesByDomain(req.params.id));
  } catch (error) {
    return ErrorHandler(res, error);
  }
});

export default {
  router
}