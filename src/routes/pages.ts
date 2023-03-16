/**
 * @author: Toni Lukkaroinen
 * @license: MIT
 * 
 * 
 * TODO: Lets do OpenAPI specifications later, when the time..
 * openapi: '3.0.0'
 * info: 
 *   version: '1.0.0'
 *   title: 'HoosatCMS Pages'
 *   description: 'Create, list, update, delete pages'
 * 
 * paths:  
 *   /pages:
 *     post:
 *       summary: "Create a new article",
 *   /pages:
 *     put:
 *       summary: "Update article"
 *   /pages/:id         GET           - Get a page by ID
 *   /pages/domain/:id  GET           - Get pages by domain
 *   /pages/group/:id   GET           - Get pages by group
 *   /pages/author/:id  GET           - Get pages by author
 *   /pages/:id         DELETE        - Delete a page by ID
 */

import express from "express";
import { confirmPermission, getGroup } from "../lib/groups";
import { createPage, deletePage, getPage, getPagesByDomain, updatePage } from "../lib/pages";
import { confirmToken } from "../lib/sessions";


const router = express.Router();


/**
 * Handles HTTP POST requests for adding page.
 * @function
 * @async
 * @param {Object} req - The HTTP request object.
 * @param {string} req.headers.authorization - Session token
 * @param {Object} req.body.page - PageDTO
 * @param {Object} res - The HTTP response object.
 * @returns {Object} The HTTP with status code and JSON object with result, message and article properties.
 * @throws {Object} The HTTP response with status code and error message.
 */
router.post("/pages/", async (req, res) => {
  try {
    const { session, account } = await confirmToken(req.headers.authorization);
    const { permission, group } = await confirmPermission(account, "WRITE");
    return res.status(200).json(await createPage(account, group, req.body.page));
  } catch (error) {
    console.log(error);
    if (typeof error === "object" && error !== null) {
      return res.status(500).json({ result: "error", message: error.toString() });
    } else {
      return res.status(500).json({ result: "error", message: "Unknown error" });
    }
  }
});

/**
 * Handles HTTP PUT requests for adding page.
 * @function
 * @async
 * @param {Object} req - The HTTP request object.
 * @param {string} req.headers.authorization - Session token
 * @param {Object} req.body.page - PageDTO
 * @param {Object} res - The HTTP response object.
 * @returns {Object} The HTTP with status code and JSON object with result, message and article properties.
 * @throws {Object} The HTTP response with status code and error message.
 */
router.put("/pages/", async (req, res) => {
  try {
    const { session, account } = await confirmToken(req.headers.authorization);
    const { permission, group } = await confirmPermission(account, "WRITE");
    return res.status(200).json(await updatePage(req.body.page));
  } catch (error) {
    console.log(error);
    if (typeof error === "object" && error !== null) {
      return res.status(500).json({ result: "error", message: error.toString() });
    } else {
      return res.status(500).json({ result: "error", message: "Unknown error" });
    }
  }
});

/**
 * Handles HTTP DELETE requests for adding page.
 * @function
 * @async
 * @param {Object} req - The HTTP request object.
 * @param {string} req.headers.authorization - Session token
 * @param {string} req.params.id - Page ObjectID
 * @param {Object} res - The HTTP response object.
 * @returns {Object} The HTTP with status code and JSON object with result, message and article properties.
 * @throws {Object} The HTTP response with status code and error message.
 */
router.delete("/pages/:id", async (req, res) => {
  try {
    const { session, account } = await confirmToken(req.headers.authorization);
    const { permission, group } = await confirmPermission(account, "WRITE");
    return res.status(200).json(await deletePage(req.params.id));
  } catch (error) {
    console.log(error);
    if (typeof error === "object" && error !== null) {
      return res.status(500).json({ result: "error", message: error.toString() });
    } else {
      return res.status(500).json({ result: "error", message: "Unknown error" });
    }
  }
});

/**
 * Handles HTTP Get requests for getting page by id.
 * @function
 * @async
 * @param {object} req - The HTTP rquest object.
 * @param {string} req.params.id - The id of the page to get.
 * @param {object} res - The HTTP response object.
 * @returns {Object} The HTTP with status code and JSON object with result, message and article properties.
 * @throws {Object} The HTTP response with status code and error message.
 */
router.get("/pages/:id", async (req, res) => {
  try {
    return res.status(200).json(await getPage(req.params.id));
  } catch (error) {
    console.log(error);
    if (typeof error === "object" && error !== null) {
      return res.status(500).json({ result: "error", message: error.toString() });
    } else {
      return res.status(500).json({ result: "error", message: "Unknown error" });
    }
  }
});

/**
 * Handles HTTP Get requests for getting page by domain.
 * @function
 * @async
 * @param {object} req - The HTTP rquest object.
 * @param {string} req.params.domain - The domain of the pages to get.
 * @param {object} res - The HTTP response object.
 * @returns {Object} The HTTP with status code and JSON object with result, message and article properties.
 * @throws {Object} The HTTP response with status code and error message.
 */
router.get("/pages/domain/:domain", async (req, res) => {
  try {
    if(req.params.domain === undefined) {
      return res.status(500).json({ result: "error", message: "Domain was empty" });
    }
    return res.status(200).json(await getPagesByDomain(req.params.domain));
  } catch (error) {
    console.log(error);
    if (typeof error === "object" && error !== null) {
      return res.status(500).json({ result: "error", message: error.toString() });
    } else {
      return res.status(500).json({ result: "error", message: "Unknown error" });
    }
  }
});

/**
 * Handles HTTP Get requests for getting page by author.
 * @function
 * @async
 * @param {object} req - The HTTP rquest object.
 * @param {string} req.params.author - The author id of the pages to get.
 * @param {object} res - The HTTP response object.
 * @returns {Object} The HTTP with status code and JSON object with result, message and article properties.
 * @throws {Object} The HTTP response with status code and error message.
 */
router.get("/pages/author/:author", async (req, res) => {
  try {
    if(req.params.author === undefined) {
      return res.status(500).json({ result: "error", message: "Author was empty" });
    }
    return res.status(200).json(await getPagesByDomain(req.params.author));
  } catch (error) {
    console.log(error);
    if (typeof error === "object" && error !== null) {
      return res.status(500).json({ result: "error", message: error.toString() });
    } else {
      return res.status(500).json({ result: "error", message: "Unknown error" });
    }
  }
});


/**
 * Handles HTTP Get requests for getting page by author.
 * @function
 * @async
 * @param {object} req - The HTTP rquest object.
 * @param {string} req.params.group - The group id of the pages to get.
 * @param {object} res - The HTTP response object.
 * @returns {Object} The HTTP with status code and JSON object with result, message and article properties.
 * @throws {Object} The HTTP response with status code and error message.
 */
router.get("/pages/group/:group", async (req, res) => {
  try {
    if(req.params.group === undefined) {
      return res.status(500).json({ result: "error", message: "Group was empty" });
    }
    return res.status(200).json(await getPagesByDomain(req.params.group));
  } catch (error) {
    console.log(error);
    if (typeof error === "object" && error !== null) {
      return res.status(500).json({ result: "error", message: error.toString() });
    } else {
      return res.status(500).json({ result: "error", message: "Unknown error" });
    }
  }
});

export default {
  router
}