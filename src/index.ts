import scrapeBlog from "./scraper";
import { configEthereum } from "./types";
import { newProxy, getProxy } from "./proxy";
import readBlog from "./reader";
import pLimit from "p-limit";

(async () => {
  await getProxy();
  const limit = pLimit(5);
  let tasks = [];
  for (let i = 0; i < 5; i++) {
    // Up to 5 threads with unique proxies
    tasks.push(
      limit(async () => {
        const proxy = await newProxy();
        console.log(`Using proxy #${i + 1}: ${proxy.ip}:${proxy.port}`);
        for (let j = 0; j < 5; j++) {
          // Try up to 5 times
          try {
            const links = await scrapeBlog(
              configEthereum,
              null,
              null,
              `${proxy.ip}:${proxy.port}`
            );
            console.log(`PROXY #${i + 1} ATTEMPT ${j + 1}: FOUND ${links.length} BLOGS.`);
            readBlog(links, `${proxy.ip}:${proxy.port}`);
            break; // Break when succeed
          } catch (error) {
            console.error(`Proxy #${i + 1} Attempt ${j + 1}: Failed.`);
          }
        }
      })
    );
  }
  await Promise.all(tasks);
  process.exit(0);
})();
