import RSS from "rss";
import { getArticlesByDomain } from "./articles";
import { getPagesByDomain } from "./pages";

interface CommentsRSS {
  type: "Comments",
  domain: string,
  parent: string,
}

interface ArticlesRSS {
  type: "Articles",
  domain: string
}

interface PagesRSS {
  type: "Pages",
  domain: string,
}

// TODO: Decide how to handle comments and article/page urls in RSS XML.

interface getRSSFeedProps {
  target: CommentsRSS | ArticlesRSS | PagesRSS,
  title: string,
  description: string,
  domain: string,
  limit: number,
  feedRoute?: string,
  siteRoute?: string,
  logoRoute?: string,
  managingEditor: string,
  webMaster: string,
  ttl: number
}

/**
 * Generates an RSS feed based on the specified properties.
 * @async
 * @function getRSSFeed
 * @param {getRSSFeedProps} props - The properties for generating the RSS feed.
 * @returns {Promise<string>} - A Promise that resolves to the XML string of the generated RSS feed.
 */
export const getRSSFeed = async (
   props: getRSSFeedProps
) => {
  const feed = new RSS({
    title: props.title,
    description: props.description,
    feed_url: (props.feedRoute !== undefined) ? `https://${props.domain}${props.feedRoute}` : `https://${props.domain}/articles/feed`,
    site_url: (props.siteRoute !== undefined) ? `https://${props.domain}${props.siteRoute}` : `https://${props.domain}/articles`,
    image_url: (props.logoRoute !== undefined) ? `https://${props.domain}${props.logoRoute}` : `https://${props.domain}/logo/logo512.png`,
    managingEditor: props.managingEditor,
    webMaster: props.webMaster,
    ttl: props.ttl // Time-to-live in minutes
  });

  switch(props.target.type) {
    case "Articles":
      await getFeedItemsFromArticles(props.domain, feed);
      break;
    case "Pages":
      await getFeedItemsFromPages(props.domain, feed);
      break;
    case "Comments":
      break;
  }

  const xml = feed.xml({ indent: true });
  return xml;
}

/**
 * Generates RSS feed items from articles
 * @async
 * @function
 * @param {string} domain - The domain of the articles to include in the feed
 * @param {RSS} feed - The RSS feed object to add items to
 * @returns {Promise<void>}
 * @throws {Error} Will throw an error if the articles cannot be retrieved.
 * @example
 * const feed = new RSS();
 * await getFeedItemsFromArticles('example.com', feed);
*/
const getFeedItemsFromArticles = async (
  domain: string,
  feed: RSS,
) => {
  const { articles } = await getArticlesByDomain(domain);
  articles.forEach(article => {
    feed.item({
      title: (article.header !== undefined) ? article.header : "",
      description: "",
      guid: article._id.toString(),
      url: `https://${domain}/articles/${article._id}`,
      date: (article.createdAt !== undefined) ? article.createdAt : "",
      custom_elements: [
        { 'content:encoded': { _cdata: article.markdown } }
      ]
    });
  });
}

/**
 * Returns the RSS feed items for pages from a given domain.
 * @async
 * @function
 * @param {string} domain - The domain of the pages.
 * @param {RSS} feed - The RSS feed object.
 * @returns {void}
 * @throws {Error} Will throw an error if the pages cannot be retrieved.
 * @example
 * const feed = new RSS();
 * await getFeedItemsFromPages('example.com', feed);
 */
const getFeedItemsFromPages = async (
  domain: string,
  feed: RSS,
) => {
  const { pages } = await getPagesByDomain(domain);
  pages.forEach(page => {
    feed.item({
      title: (page.name !== undefined) ? page.name : "",
      description: "",
      guid: page._id.toString(),
      url: `https://${domain}/${page._id}`,
      date: (page.createdAt !== undefined) ? page.createdAt : "",
      custom_elements: [
        { 'content:encoded': { _cdata: page.markdown } }
      ]
    });
  });
}
