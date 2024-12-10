import mongoose from "mongoose";
import Queue from "bull";

// 文章模型
const articleSchema = new mongoose.Schema({
  dataSourceId: String,
  articleUrl: String,
  content: String,
});

export const Article = mongoose.model("Article", articleSchema);

export const articleQueue = new Queue("articleQueue", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
  },
});

export interface IBlog {
  _id: string;
  blogUrl: string;
  indexPage: string;
  articleLinkSelector: string;
  nextPageSelector: string;
}

export const configCoinbase: IBlog = {
  blogUrl: "https://www.coinbase.com",
  indexPage: "/en-sg/blog",
  articleLinkSelector:
    'Array.from(document.querySelectorAll("a")).filter(a => a.querySelector("h3")).map(a => a.href)',
  _id: "coinbase",
  nextPageSelector: "",
};

export const configPhesoca: IBlog = {
  blogUrl: "https://phesoca.com",
  indexPage: "/",
  articleLinkSelector:
    "Array.from(document.querySelectorAll(\"a[rel='bookmark']\")).filter(a => a.children.length === 0).map(a => a.href)",
  _id: "phesoca",
  nextPageSelector: "",
};

export const configChrome: IBlog = {
  blogUrl: "https://developer.chrome.com/",
  indexPage: "/blog",
  articleLinkSelector:
    "Array.from(document.querySelectorAll(\"a\")).filter(a => a.querySelector('h3')).map(a => a.href)",
  _id: "chrome",
  nextPageSelector: "",
};

export const configEthereum: IBlog = {
  blogUrl: "https://blog.ethereum.org",
  indexPage: "/",
  articleLinkSelector:
    "Array.from(document.querySelectorAll(\"a[class='chakra-link css-p37gpl']\")).map(a => a.href)",
  _id: "ethereum",
  nextPageSelector:
    "path[d='M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z']",
};

import readBlog from "./reader";

articleQueue.process("article", async (job: any) => {
  await readBlog(job.data.url, job.data.config, job.data.proxy);
  // return Promise.resolve();
});

articleQueue.on("error", (error: any) => {
  console.error("Error in queue:", error);
});

articleQueue.on("completed", (job: any) => {
  console.log(`Job with id ${job.id} has been completed`);
});

articleQueue.on("failed", (job: any, err: any) => {
  console.error(`Job with id ${job.id} has failed with error ${err.message}`);
});
