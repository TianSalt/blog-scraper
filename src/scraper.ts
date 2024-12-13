import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { IBlog, Article, articleQueue } from "./database";
import { Page } from "puppeteer";

export async function getArticles(config: IBlog, proxy: string | null = null) {
  puppeteer.use(StealthPlugin());

  let browser;
  if (proxy) {
    browser = await puppeteer.launch({
      args: [`--proxy-server=${proxy}`],
    });
  } else {
    browser = await puppeteer.launch();
  }
  let page = await browser.newPage();
  await page.goto(`${config.blogUrl}${config.indexPage}`, {
    waitUntil: "networkidle2",
  });

  if (config.moreSelector !== "") {
    const moreLimit = 100;
    for (let moreNumber = 0; moreNumber < moreLimit; moreNumber++) {
      try {
        await page.waitForSelector(config.moreSelector, { timeout: 5000 });
        await page.click(config.moreSelector);
        console.log(`Clicked MORE for ${moreNumber + 1} times`);
        await new Promise((r) => setTimeout(r, Math.random() * 500 + 500));
      } catch (error) {
        console.log(`MORESELECTOR: ${error}`);
        break;
      }
      if (moreNumber === moreLimit - 1)
        console.error("MORESELECTOR: Max more-limit excceeded.");
    }
  }

  let blogLinks = await page.evaluate((config) => {
    return eval(config.articleLinkSelector);
  }, config);

  if (config.nextPageSelector !== "") {
    const pageLimit = 100;
    for (let pageNumber = 0; pageNumber < pageLimit; pageNumber++) {
      try {
        await page.waitForSelector(config.nextPageSelector, { timeout: 5000 });
        await page.click(config.nextPageSelector);
        console.log(`Turned to Page ${pageNumber + 2}`);
        await new Promise((r) => setTimeout(r, Math.random() * 500 + 500));
        let links = await page.evaluate((config) => {
          return eval(config.articleLinkSelector);
        }, config);
        blogLinks = await blogLinks.concat(links);
      } catch (error) {
        console.log(`NEXTPAGESELECTOR: ${error}`);
        break;
      }
      if (pageNumber === pageLimit - 1)
        console.error("MORESELECTOR: Max more-limit excceeded.");
    }
  }

  if (browser) {
    await page.close();
    await browser.close();
  }

  return blogLinks;
}

export default async function scrapeBlog(
  config: IBlog,
  existingPage: Page | null = null,
  limit: number | null = null,
  proxy: string | null = null
) {
  let blogLinks = await getArticles(config, proxy);

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
