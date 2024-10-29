const express = require("express")();
let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}

express.get("/api", async (req, res) => {
  let options = {};

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [
        ...chrome.args,
        "--hide-scrollbars",
        "--disable-web-security",
        "--no-sandbox", // Added for additional compatibility
        "--disable-setuid-sandbox" // Added for additional compatibility
      ],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    };
  }

  try {
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();

    await page.goto("https://www.google.com", {
      waitUntil: "domcontentloaded",
      timeout: 5000
    });

    const title = await page.title();
    res.send(title);

    await browser.close();
  } catch (err) {
    console.error('Error during Puppeteer operation:', err);
    res.status(500).send('Error fetching title: ' + err.message);
  }
});

express.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});

module.exports = express;
