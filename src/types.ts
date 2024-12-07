export interface IBlog {
  blogUrl: string;
  indexPage: string;
  articleLinkSelector: string;
  _id: string;
}

export const Article = {
  find: async (
    query: any,
    projection: string
  ): Promise<{ articleUrl: string }[]> => {
    return [];
  },
};

export const articleQueue = {
  add: async (url: string, data: any) => {
    console.log(`Article added to queue: ${url}`);
  },
};

export const configCoinbase: IBlog = {
  blogUrl: "https://www.coinbase.com",
  indexPage: "/en-sg/blog",
  articleLinkSelector:
    'Array.from(document.querySelectorAll("a")).filter(a => a.querySelector("h3")).map(a => a.href)',
  _id: "coinbase",
};

export const configPhesoca: IBlog = {
  blogUrl: "https://phesoca.com",
  indexPage: "/",
  articleLinkSelector:
    "Array.from(document.querySelectorAll(\"a[rel='bookmark']\")).filter(a => a.children.length === 0).map(a => a.href)",
  _id: "phesoca",
};

export const configChrome: IBlog = {
  blogUrl: "https://blog.google",
  indexPage: "/products/chrome/",
  articleLinkSelector:
    "Array.from(document.querySelectorAll(\"a[class='feed-article__overlay']\")).map(a => a.href)",
  _id: "chrome",
};

export const configEthereum: IBlog = {
  blogUrl: "https://blog.ethereum.org",
  indexPage: "/",
  articleLinkSelector:
    "Array.from(document.querySelectorAll(\"a[class='chakra-link css-p37gpl']\")).map(a => a.href)",
  _id: "ethereum",
};