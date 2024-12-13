import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Article, IBlog } from "./database";
import { newProxy } from "./proxy";

export default async function readBlog(
  articleUrl: string,
  config: IBlog,
  proxy: string | null = null
) {
  puppeteer.use(StealthPlugin());
  let browser;
  if (proxy) {
    browser = await puppeteer.launch({
      args: [`--proxy-server=${proxy}`],
    });
  } else {
    browser = await puppeteer.launch();
  }

  for (let i = 0; i < 10; i++) {
    try {
      let page = await browser.newPage();
      await page.goto(articleUrl, {
        waitUntil: "networkidle2",
      });
      const content = await page.content();
      const article = new Article({
        dataSourceId: config._id,
        articleUrl,
        content,
      });
      await article.save();
      console.log(`[SUCCEED] Attempt ${i + 1} fetching article ${articleUrl}`);
      if (browser) {
        await page.close();
        await browser.close();
      }
      break;
    } catch (error) {
      if (browser) {
        await browser.close();
      }
      console.log(`[FAILED]  Attempt ${i + 1} fetching article ${articleUrl}`);
      // if (proxy && proxy.length >= 2) {
      //   await browser.close();
      //   let proxy = await newProxy();
      //   browser = await puppeteer.launch({
      //     args: [`--proxy-server=${proxy.ip}:${proxy.port}`],
      //   });
      //   console.log(`Now use ${proxy.ip}:${proxy.port} to fetch ${articleUrl}`);
      // }
    }
  }
}
