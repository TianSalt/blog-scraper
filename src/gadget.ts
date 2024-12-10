const readline = require("readline");

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function showProgress(duration: number) {
  const totalTicks = 50; // 进度条长度
  const interval = duration / totalTicks;
  const progressBar = "█";

  for (let i = 0; i <= totalTicks; i++) {
    process.stdout.write(
      `\rWating ${Math.floor((i * interval) / 1000)} / ${Math.floor(
        duration / 1000
      )} s [${progressBar.repeat(i)}${" ".repeat(totalTicks - i)}]`
    );
    await sleep(interval);
  }

  console.log();
}
