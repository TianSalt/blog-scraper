import axios from "axios";
import * as net from "net";

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

const workingProxies: Proxy[] = [];
const url =
  "http://route.xiongmaodaili.com/xiongmao-web/api/glip?secret=ca9d53779793bd500c5f10dbbd539c9a&orderNo=GL202412070433260RLkTbTv&count=10&isTxt=0&proxyType=1&returnAccount=1";

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

function testProxy(proxy: Proxy): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(5000);
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });

    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(parseInt(proxy.port), proxy.ip);
  });
}

export async function getProxy() {
  const proxies = await fetchProxies(url);
  for (const proxy of proxies) {
    const isWorking = await testProxy(proxy);
    if (isWorking) {
      workingProxies.push(proxy);
      console.log(`Proxy ${proxy.ip}:${proxy.port} is working.`);
    } else {
      console.log(`Proxy ${proxy.ip}:${proxy.port} is not working.`);
    }
  }
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
