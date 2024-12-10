import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Article, IBlog } from "./database";

export default async function readBlog(
  articleUrl: string,
  config: IBlog,
  proxy: string
) {
  puppeteer.use(StealthPlugin());
  const browser = await puppeteer.launch({
    args: [`--proxy-server=${proxy}`],
  });
  for (let i = 0; i < 10; i++) {
    try {
      // await new Promise((r) => setTimeout(r, Math.random() * 5000));
      let page = await browser.newPage();
      await page.goto(articleUrl, {
        waitUntil: "networkidle2",
      });
      const content = await page.content();
      console.log(`+ Attempt ${i + 1} getting article ${articleUrl}`);
      const article = new Article({
        dataSourceId: config._id,
        articleUrl,
        content,
      });
      await article.save();
      await page.close();
      return;
    } catch (error) {
      console.error(`- Attempt ${i + 1} getting article ${articleUrl}`);
    }
  }
  await browser.close();
}
