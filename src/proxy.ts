import axios from "axios";
import * as net from "net";
import { IBlog } from "./database";
import puppeteer from "puppeteer";

interface Proxy {
  port: string;
  ip: string;
}

interface ApiResponse {
  code: string;
  msg: string;
  obj: Proxy[];
  errno: number;
  data: any[];
}

let workingProxies: Proxy[] = [];
const url =
  "http://pandavip.xiongmaodaili.com/xiongmao-web/apiPlus/vgl?secret=ca9d53779793bd500c5f10dbbd539c9a&orderNo=VGL2024121222300878etb2CM&count=5&isTxt=0&proxyType=1&validTime=0&removal=0&cityIds=&returnAccount=1";

async function fetchProxies(url: string): Promise<Proxy[]> {
  try {
    const response = await axios.get<ApiResponse>(url);
    if (response.data.code === "0") {
      return response.data.obj;
    } else {
      throw new Error(`Error fetching proxies: ${response.data.msg}`);
    }
  } catch (error) {
    console.error("Error fetching proxies:", error);
    return [];
  }
}

export async function getProxy(config: IBlog) {
  workingProxies = await fetchProxies(url);
  // const proxies = await fetchProxies(url);
  // let browser;
  // for (const proxy of proxies) {
  //   console.log(
  //     `Testing proxy ${proxy.ip}:${proxy.port} to ${config.blogUrl}${config.indexPage}`
  //   );
  //   try {
  //     browser = await puppeteer.launch({
  //       args: [`--proxy-server=${proxy.ip}:${proxy.port}`],
  //     });
  //     let page = await browser.newPage();
  //     await page.goto(`${config.blogUrl}${config.indexPage}`, {
  //       waitUntil: "networkidle2",
  //     });
  //     console.log("Reachable.");
  //     workingProxies.push(proxy);
  //     if (browser) await browser.close();
  //   } catch (error) {
  //     console.error("Failed.");
  //     if (browser) await browser.close();
  //   }
  // }
  // if (browser) await browser.close();
}

export async function newProxy(): Promise<Proxy> {
  const proxy = workingProxies.shift();
  if (proxy) {
    workingProxies.push(proxy);
    return proxy;
  } else {
    throw new Error("No available proxies");
  }
}
