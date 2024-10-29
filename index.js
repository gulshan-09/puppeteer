const app = require("express")();
let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}

app.get("/api", async (req, res) => {
  let options = {};

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security", "--no-sandbox", "--disable-setuid-sandbox"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath || '/usr/bin/chromium-browser',
      headless: true,
      ignoreHTTPSErrors: true,
    };
  }

  try {
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();

    // Set timeout for navigation to avoid long waits
    await page.goto("https://anikoto.fun", { waitUntil: 'domcontentloaded', timeout: 15000 });
    const pageTitle = await page.title();

    await browser.close(); // Ensure the browser is closed after use
    res.send(pageTitle);
  } catch (err) {
    console.error("Error during Puppeteer execution:", err);
    res.status(500).send("An error occurred while fetching the page title.");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});

module.exports = app;
