import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { IBlog, Article, articleQueue } from "./database";
import { Page } from "puppeteer";

export default async function scrapeBlog(
  config: IBlog,
  existingPage: Page | null = null,
  limit: number | null = null,
  proxy: string | null = null
) {
  puppeteer.use(StealthPlugin());

  let browser = await puppeteer.launch({
    args: [`--proxy-server=${proxy}`],
  });
  let page = await browser.newPage();

  await page.goto(`${config.blogUrl}${config.indexPage}`, {
    waitUntil: "networkidle2",
  });

  let blogLinks = await page.evaluate((config) => {
    return eval(config.articleLinkSelector);
  }, config);

  const pageLimit = 100;
  if (config.nextPageSelector !== "") {
    for (let pageNumber = 1; pageNumber < pageLimit; pageNumber++) {
      try {
        // await new Promise((r) => setTimeout(r, Math.random() * 1000));
        await page.click(config.nextPageSelector);
        let links = await page.evaluate((config) => {
          return eval(config.articleLinkSelector);
        }, config);
        console.log(links[1]);
        blogLinks = await blogLinks.concat(links);
        console.log(`Read Page ${pageNumber}`);
      } catch (error) {
        console.log(`MORESELECTOR: ${error}`);
        break;
      }
    }
  }

  if (browser) {
    await page.close();
    await browser.close();
  }

  if (limit) blogLinks = blogLinks.slice(0, limit);

  const existingArticleLinks = await Article.find(
    { dataSourceId: config._id },
    "articleUrl"
  );

  const existingArticleLinksSet = new Set(
    existingArticleLinks.map((a) => a.articleUrl)
  );

  const newLinks = blogLinks.filter(
    (url: string) => !existingArticleLinksSet.has(url)
  );

  for (const url of newLinks) {
    console.log("Adding article to queue", url);
    await articleQueue.add("article", { url, config, proxy });
  }

  return blogLinks;
}
