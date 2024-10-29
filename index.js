const express = require("express")();
let chrome = {};
let puppeteer;

// Check if running in AWS Lambda environment
if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}

// Endpoint to fetch page title
express.get("/api", async (req, res) => {
  let options = {};

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    };
  }

  try {
    // Launch the browser with optimized options
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();

    // Set a shorter timeout for navigation
    await page.goto("https://www.google.com", {
      waitUntil: "domcontentloaded", // Change to "domcontentloaded" for quicker load
      timeout: 5000 // 5 seconds timeout
    });

    // Get the page title
    const title = await page.title();
    res.send(title);
    
    await browser.close(); // Close the browser after fetching the title
  } catch (err) {
    console.error('Error during Puppeteer operation:', err);
    res.status(500).send('Error fetching title: ' + err.message);
  }
});

// Listen on specified port
express.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});

module.exports = express;
