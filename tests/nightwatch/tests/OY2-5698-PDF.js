const path = require("path");
const timeout = 1000;

const mySelector = "//*[@data-testid='textInput']";

module.exports = {
  "@tags": ["smoke", "year", "tag1"],

  before: function (browser) {
    console.log("Setting up the browser instance...");
    console.log("Opening the browser...");
    browser
      .maximizeWindow()
      .url(browser.launch_url)
      .waitForElementPresent("body");
    // Login credentails are pulled from .env files, this file should not be tracked and
    // must be stated in the .gitignore file
    //Click on Login with EUA ID
    browser.useCss().click("button.usa-button[data-testid='LoaderButton']");
    const username = browser.globals.user;
    const password = browser.globals.pass;
    // Login activities
    //browser.useCss().click(".LoginWithOkta .LoaderButton");
    browser
      .useCss()
      .setValue("input#okta-signin-username", username)
      .pause(100);
    browser
      .useCss()
      .setValue("input#okta-signin-password", password)
      .pause(100);
    browser.useCss().click("input#tandc");
    browser.useCss().click("input#okta-signin-submit").pause(3000);
    browser.waitForElementPresent("body");
  },
  after: function (browser) {
    console.log("Stopping test executions...");
    console.log("Closing down the browser instance...");
    browser.end();
  },

  "Click on Quarter1": function (browser) {
    const tests_data = {
      quarter3: {
        selector: "//*[@id='2021']/ul/li/a",
      },
      plus: {
        selector: "//*[@id='root']/div/div[2]/div/div/div/div/h2[1]/button",
      },
    };
    browser.click("xpath", tests_data.plus.selector);
    browser.pause(timeout * 3);
    browser.click("xpath", tests_data.quarter3.selector); //.waitForElementPresent('body');
    browser.pause(timeout * 5);
  },

  "Click on PDF and Print and go back to Quarter3 ": function (browser) {
    const tests_data = {
      pdf: {
        selector: "//*[@id='root']/div/div[2]/div/button",
      },
      print: {
        selector: "//*[@id='root']/div/div[2]/button",
      },
      back: {
        selector: "//*[@id='root']/div/div[2]/div[1]/div/a[2]",
      },
      chip: {
        selector: "div[id=row-0] > div > a",
      },
      ec: {
        selector: "div[id=row-1] > div > a",
      },
      e: {
        selector: "div[id=row-2] > div > a",
      },
      pw: {
        selector: "div[id=row-3] > div > a",
      },
      gre: {
        selector: "div[id=row-4] > div > a",
      },
      chiptext: {
        selector: "//*[@id='root']/div/div[2]/div/div[1]/div[2]/div[1]/h2",
      },
      main: {
        selector: "//*[@id='root']/div/div[2]/div/h1",
      },
    };
    //21E pdf
    browser.click(tests_data.chip.selector).waitForElementPresent("body");
    browser.pause(timeout * 8);
    browser.click("xpath", tests_data.pdf.selector);
    browser.click("xpath", tests_data.print.selector);
    browser.pause(timeout * 5);
    browser
      .click("xpath", tests_data.back.selector)
      .waitForElementPresent("body");
    browser.pause(timeout * 6);

    //64.EC pdf
    browser.click(tests_data.ec.selector).waitForElementPresent("button");
    browser.pause(timeout * 6);
    browser.click("xpath", tests_data.pdf.selector);
    browser.click("xpath", tests_data.print.selector);
    browser.click("xpath", tests_data.back.selector);

    //64.21E pdf
    browser.click(tests_data.e.selector).waitForElementPresent("body");
    browser.pause(timeout * 6);
    browser.click("xpath", tests_data.pdf.selector);
    browser.click("xpath", tests_data.print.selector);
    browser.click("xpath", tests_data.back.selector);

    //21PW pdf
    browser.click(tests_data.pw.selector).waitForElementPresent("body");
    browser.pause(timeout * 6);
    browser.click("xpath", tests_data.pdf.selector);
    browser.click("xpath", tests_data.print.selector);
    browser.click("xpath", tests_data.back.selector);

    //GRE pdf
    browser.click(tests_data.gre.selector).waitForElementPresent("body");
    browser.pause(timeout * 6);
    browser.click("xpath", tests_data.pdf.selector);
    browser.click("xpath", tests_data.print.selector);
    browser.click("xpath", tests_data.back.selector);
    browser.pause(timeout * 3);
  },
};
