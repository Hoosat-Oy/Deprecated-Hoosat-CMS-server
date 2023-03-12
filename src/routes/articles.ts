import express from 'express';
import authentication from './authentication';

import groups from './groups';

import articlesSchema, { IArticles } from '../schemas/articlesSchema';
import { IAccounts } from '../schemas/accountsSchema';
import { IGroups } from '../schemas/groupsSchema';

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

/**
 * Creates a new article for a group.
 * @function
 * @async
 * @param {IAccounts} author - The account that is creating the article.
 * @param {IGroups} group - The group that owns the article.
 * @param {ArticleProps} data - The article that is saved.
 * @returns {Promise<Null | IArticles>} - A promise that resolves to null or the saved article indicating wheter saving the article worked or not.
 */

interface ArticleProps {
  header: string,
  markdown: string,
  read: number,
  domain: string,
  publish: boolean,
}

const addArticle = async (
  author: IAccounts,
  group: IGroups,
  data: ArticleProps,
): Promise<null | IArticles> => {
  const article = new articlesSchema({
    group: group._id,
    author: author._id,
    header: data.header,
    markdown: data.markdown,
    read: data.read,
    domain: data.domain,
    publish: data.publish,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  const savedArticle = await article.save();
  if(savedArticle) {
    return savedArticle;
  }
  return null;
}

/**
 * Updates article.
 * @function
 * @async
 * @param {string} id - The identifier of the article to be updated.
 * @param {ArticleProps} data - The data that is to be updated.
 * @returns {Promise<Null | IArticles>} - A promise that resolves to null or the updated article indicating wheter updating the article worked or not.
 */
const updateArticle = async (
  id: string,
  data: ArticleProps,
): Promise<null | IArticles> => {
  const updatedArticle = await articlesSchema.findOneAndUpdate({ _id: id }, {
    header: data.header,
    markdown: data.markdown,
    read: data.read,
    domain: data.domain,
    publish: data.publish,
    updatedAt: Date.now(),
  }).exec();
  if(updatedArticle) {
    return updatedArticle;
  }
  return null;
}

/**
 * Delete article.
 * @function
 * @async
 * @param {string} id - The identifier of the article to be deleted.
 * @returns {Promise<Null | IArticles>} - A promise that resolves to null or the deleted article indicating wheter deleting the article worked or not.
 */
const deleteArticle = async (
  id: string,
): Promise<null | IArticles> => {
  const deletedArticle = await articlesSchema.findOneAndDelete({ _id: id}).exec();
  if(deletedArticle) {
    return deletedArticle;
  }
  return null;
}

/**
 * Get public articles.
 * @function
 * @async
 * @param {string} domain - The identifier of the article to be searched.
 * @returns {Promise<Null | IArticles>} - A promise that resolves to null or the article.
 */
const getPublicArticles = async (
): Promise<null | IArticles> => {
  const article = await articlesSchema.findOne({ public: true }).exec();
  if(article) {
    return article;
  }
  return null;
}


/**
 * Get public articles by domain.
 * @function
 * @async
 * @param {string} domain - The identifier of the article to be searched.
 * @returns {Promise<Null | IArticles>} - A promise that resolves to null or the article.
 */
const getPublicArticlesByDomain = async (
  domain: string,
): Promise<null | IArticles> => {
  const article = await articlesSchema.findOne({ public: true, domain: domain }).exec();
  if(article) {
    return article;
  }
  return null;
}

/**
 * Get public articles by group.
 * @function
 * @async
 * @param {IGroups} group - The identifier of the article to be searched.
 * @returns {Promise<Null | IArticles>} - A promise that resolves to null or the article.
 */
const getPublicArticlesByGroup = async (
  group: IGroups,
): Promise<null | IArticles> => {
  const article = await articlesSchema.findOne({ public: true, group: group._id }).exec();
  if(article) {
    return article;
  }
  return null;
}

/**
 * Get public articles by author.
 * @function
 * @async
 * @param {IAccounts} author - The identifier of the article to be searched.
 * @returns {Promise<Null | IArticles>} - A promise that resolves to null or the article.
 */
const getPublicArticlesByAuthor = async (
  author: IAccounts,
): Promise<null | IArticles> => {
  const article = await articlesSchema.findOne({ public: true, author: author._id }).exec();
  if(article) {
    return article;
  }
  return null;
}

/**
 * Get article by id.
 * @function
 * @async
 * @param {string} id - The identifier of the article to be searched.
 * @returns {Promise<Null | IArticles>} - A promise that resolves to null or the article.
 */
const getArticle = async (
  id: string,
): Promise<null | IArticles> => {
  const article = await articlesSchema.findOne({ _id: id }).exec();
  if(article) {
    return article;
  }
  return null;
}

/**
 * Get article by group.
 * @function
 * @async
 * @param {IGroups} group - The group identifier of the article to be searched.
 * @returns {Promise<Null | IArticles>} - A promise that resolves to null or the article.
 */
const getArticlesByGroup = async (
  group: IGroups
): Promise<null | IArticles[]> => {
  const articles = await articlesSchema.find({ group: group._id });
  if(articles) {
    return articles;
  }
  return null;
}

/**
 * Get article by group id.
 * @function
 * @async
 * @param {IAccounts} group - The account identifier of the article to be searched.
 * @returns {Promise<Null | IArticles>} - A promise that resolves to null or the article.
 */
const getArticlesByAuthor = async (
  author: IAccounts
): Promise<null | IArticles[]> => {
  const articles = await articlesSchema.find({author: author._id});
  if(articles) {
    return articles;
  }
  return null;
}

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
    const { account, group } = await groups.checkAuthorizationAndGroupPermission(req.headers.authorization, "WRITE");
    const article = addArticle(account, group, req.body.article);
    if(article) {
      return res.status(200).json({ result: "success", message: "Article has been saved.", article: article });
    } else {
      return res.status(500).json({ result: "error", message: "Saving article failed for some reason." });
    }
  } catch (error) {
    return res.status(500).json({ result: "error", message: error });
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
    const { account, group } = await groups.checkAuthorizationAndGroupPermission(req.headers.authorization, "WRITE");
    const article = updateArticle(req.body.article._id, req.body.article);
    if(article) {
      return res.status(200).json({ result: "success", message: "Article has been saved.", article: article });
    } else {
      return res.status(500).json({ result: "error", message: "Saving article failed for some reason." });
    }
  } catch (error) {
    return res.status(500).json({ result: "error", message: error });
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
    const { account, group } = await groups.checkAuthorizationAndGroupPermission(req.headers.authorization, "DELETE");
    const article = deleteArticle(req.params.id);
    if(article) {
      return res.status(200).json({ result: "success", message: "Article has been deleted.", article: article });
    } else {
      return res.status(500).json({ result: "error", message: "Deleting article failed for some reason." });
    }
  } catch (error) {
    return res.status(500).json({ result: "error", message: error });
  }
});

/**
* /articles/               GET         - Get all public articles
* /articles/:id            GET         - Get article by ID
* /group/articles/         GET         - Get all articles by group ID
* /account/articles/       GET         - Get all articles by account ID
*/

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
    const article = getPublicArticles();
    if(article) {
      return res.status(200).json({ result: "success", message: "Article has been deleted.", article: article });
    } else {
      return res.status(500).json({ result: "error", message: "Deleting article failed for some reason." });
    }
  } catch (error) {
    return res.status(500).json({ result: "error", message: error });
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
    const article = getArticle(req.params.id);
    if(article) {
      return res.status(200).json({ result: "success", message: "Article has been deleted.", article: article });
    } else {
      return res.status(500).json({ result: "error", message: "Deleting article failed for some reason." });
    }
  } catch (error) {
    return res.status(500).json({ result: "error", message: error });
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
    const article = getPublicArticlesByDomain(req.params.id);
    if(article) {
      return res.status(200).json({ result: "success", message: "Article has been deleted.", article: article });
    } else {
      return res.status(500).json({ result: "error", message: "Deleting article failed for some reason." });
    }
  } catch (error) {
    return res.status(500).json({ result: "error", message: error });
  }
});

export default {
  router,
  addArticle,
  updateArticle,
  deleteArticle,
  getPublicArticles,
  getPublicArticlesByDomain,
  getArticle,
  getArticlesByAuthor,
  getArticlesByGroup,
}