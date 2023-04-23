
import { AccountsDTO } from "../schemas/accountsSchema";
import articlesSchema, { ArticlesDTO } from "../schemas/articlesSchema";
import { GroupsDTO } from "../schemas/groupsSchema";


interface ArticleResultDTO {
  result: string,
  message: string
  article: ArticlesDTO
}

interface ArticlesResultDTO {
  result: string,
  message: string
  articles: ArticlesDTO[]
}

/**
 * Creates a new article for a group.
 * @function
 * @async
 * @param {AccountsDTO} author - The account that is creating the article.
 * @param {GroupsDTO} group - The group that owns the article.
 * @param {ArticlesDTO} data - The article that is saved.
 * @returns {Promise<ArticlesResultDTO>} - A promise that resolves to null or the saved article indicating wheter saving the article worked or not.
 */
export const createArticle = async (
  author: AccountsDTO,
  group: GroupsDTO,
  data: ArticlesDTO,
): Promise<ArticleResultDTO> => {
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
    return { result: "success", message: "Article has been saved.", article: savedArticle };
  } else {
    throw new Error("Could not save article.")
  }

}

/**
 * Updates article.
 * @function
 * @async
 * @param {ArticlesDTO} data - The data that is to be updated.
 * @returns {Promise<ArticleResultDTO>} - A promise that resolves to null or the updated article indicating wheter updating the article worked or not.
 */
export const updateArticle = async (
  data: ArticlesDTO,
): Promise<ArticleResultDTO> => {
  const updatedArticle = await articlesSchema.findOneAndUpdate({ _id: data._id }, {
    header: data.header,
    markdown: data.markdown,
    read: data.read,
    domain: data.domain,
    publish: data.publish,
    updatedAt: Date.now(),
  }).exec();
  if(updatedArticle) {
    return { result: "success", message: "Article has been updated.", article: updatedArticle };
  } else {
    throw new Error("Could not update article.")
  }
}

/**
 * Delete article.
 * @function
 * @async
 * @param {string} id - The identifier of the article to be deleted.
 * @returns {Promise<ArticleResultDTO>} - A promise that resolves to null or the deleted article indicating wheter deleting the article worked or not.
 */
export const deleteArticle = async (
  id: string,
): Promise<ArticleResultDTO> => {
  const deletedArticle = await articlesSchema.findOneAndDelete({ _id: id}).exec();
  if(deletedArticle) {
    return { result: "success", message: "Article has been deleted.", article: deletedArticle };
  } else {
    throw new Error("Could not delete article.")
  }
}

/**
 * Get public articles.
 * @function
 * @async
 * @returns {Promise<ArticlesResultDTO>} - A promise that resolves to null or the article.
 */
export const getPublicArticles = async (
): Promise<ArticlesResultDTO> => {
  const articles = await articlesSchema.find({ public: true }).exec();
  if(articles) {
    return { result: "success", message: "Articles found.", articles: articles };
  } else {
    throw new Error("Could not find articles.")
  }
}


/**
 * Get public articles by domain.
 * @function
 * @async
 * @param {string} domain - The identifier of the article to be searched.
 * @returns {Promise<ArticlesResultDTO>} - A promise that resolves to null or the article.
 */
export const getPublicArticlesByDomain = async (
  domain: string,
): Promise<ArticlesResultDTO> => {
  const articles = await articlesSchema.find({ public: true, domain: domain }).exec();
  if(articles) {
    return { result: "success", message: "Articles found.", articles: articles };
  } else {
    throw new Error("Could not find articles.")
  }
}

/**
 * Get public articles by group.
 * @function
 * @async
 * @param {GroupsDTO} group - The identifier of the article to be searched.
 * @returns {Promise<ArticlesResultDTO>} - A promise that resolves to null or the article.
 */
export const getPublicArticlesByGroup = async (
  group: GroupsDTO,
): Promise<ArticlesResultDTO> => {
  const articles = await articlesSchema.find({ public: true, group: group._id }).exec();
  if(articles) {
    return { result: "success", message: "Articles found.", articles: articles };
  } else {
    throw new Error("Could not find articles.")
  }
}

/**
 * Get public articles by author.
 * @function
 * @async
 * @param {AccountsDTO} author - The identifier of the article to be searched.
 * @returns {Promise<ArticlesResultDTO>} - A promise that resolves to null or the article.
 */
export const getPublicArticlesByAuthor = async (
  author: AccountsDTO,
): Promise<ArticlesResultDTO> => {
  const articles = await articlesSchema.find({ public: true, author: author._id }).exec();
  if(articles) {
    return { result: "success", message: "Articles found.", articles: articles };
  } else {
    throw new Error("Could not find articles.")
  }
}

/**
 * Get article by id.
 * @function
 * @async
 * @param {string} id - The identifier of the article to be searched.
 * @returns {Promise<ArticleResultDTO>} - A promise that resolves to null or the article.
 */
export const getArticle = async (
  id: string,
): Promise<ArticleResultDTO> => {
  const article = await articlesSchema.findOne({ _id: id }).exec();
  if(article) {
    return { result: "success", message: "Articles found.", article: article };
  } else {
    throw new Error("Could not find articles.")
  }
}

/**
 * Get article by group.
 * @function
 * @async
 * @param {GroupsDTO} group - The group identifier of the article to be searched.
 * @returns {Promise<ArticlesResultDTO>} - A promise that resolves to null or the article.
 */
export const getArticlesByGroup = async (
  group: GroupsDTO
): Promise<ArticlesResultDTO> => {
  const articles = await articlesSchema.find({ group: group._id });
  if(articles) {
    return { result: "success", message: "Articles found.", articles: articles };
  } else {
    throw new Error("Could not find articles.")
  }
}

/**
 * Get article by domain.
 * @function
 * @async
 * @param {string} domain - The domain identifier of the article to be searched.
 * @returns {Promise<ArticlesResultDTO>} - A promise that resolves to null or the article.
 */
export const getArticlesByDomain = async (
  domain: string
): Promise<ArticlesResultDTO> => {
  const articles = await articlesSchema.find({ domain: domain });
  if(articles) {
    return { result: "success", message: "Articles found.", articles: articles };
  } else {
    throw new Error("Could not find articles.")
  }
}

/**
 * Get article by group id.
 * @function
 * @async
 * @param {AccountsDTO} group - The account identifier of the article to be searched.
 * @returns {Promise<Null | ArticlesDTO>} - A promise that resolves to null or the article.
 */
export const getArticlesByAuthor = async (
  author: AccountsDTO
): Promise<null | ArticlesDTO[]> => {
  const articles = await articlesSchema.find({author: author._id});
  if(articles) {
    return articles;
  }
  return null;
}
