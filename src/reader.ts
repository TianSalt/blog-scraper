import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import pLimit from "p-limit";

export default async function readBlog(
  linkList: string[],
  proxy: string | null = null
) {
  puppeteer.use(StealthPlugin());
  let browser;
  if (proxy)
    browser = await puppeteer.launch({
      args: [`--proxy-server=${proxy}`],
    });
  else browser = await puppeteer.launch();
  const limit = pLimit(5);
  let tasks = [];
  for (const url of linkList) {
    tasks.push(
      limit(async () => {
        try {
          await new Promise((r) => setTimeout(r, Math.random() * 2000));
          let page = await browser.newPage();
          await page.goto(url, {
            waitUntil: "networkidle2",
          });
          await page.content();
          console.log(`Succeeded to read ${url}`);
          page.close();
        } catch (error) {
          console.error(`Failed    to read ${url}`);
        }
      })
    );
  }
  await Promise.all(tasks);
}
