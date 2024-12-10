import scrapeBlog from "./scraper";
import { configEthereum } from "./database";
import { newProxy, getProxy } from "./proxy";
import mongoose from "mongoose";

(async () => {
  await mongoose.connect("mongodb://localhost:27017/");
  await getProxy();
  // await showProgress(60000);
  for (let i = 0; i < 5; i++) {
    // Try 5 proxies
    let succeed = false;
    const proxy = await newProxy();
    console.log(`Using proxy #${i + 1}: ${proxy.ip}:${proxy.port}`);
    try {
      const links = await scrapeBlog(
        configEthereum,
        null,
        null,
        `${proxy.ip}:${proxy.port}`
      );
      console.log(`FOUND ${links.length} ARITICLES.`);
      succeed = true;
      break; // Break when succeed
    } catch (error) {
      console.error(error);
    }
    if (succeed) return;
  }
})();
