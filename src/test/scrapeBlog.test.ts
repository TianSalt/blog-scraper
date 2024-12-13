import { getArticles } from "../scraper";

const mockConfigPhesoca = {
  blogUrl: `file:///${__dirname}/phesoca.html`,
  indexPage: "",
  articleLinkSelector:
    "Array.from(document.querySelectorAll(\"a[rel='bookmark']\")).filter(a => a.children.length === 0).map(a => a.href)",
  _id: "mockphesoca",
  nextPageSelector: "",
  moreSelector: "",
};

test("Test: Scrapes blog links", async () => {
  const links = await getArticles(mockConfigPhesoca);
  expect(links).toBeDefined();
  expect(Array.isArray(links)).toBe(true);
});
