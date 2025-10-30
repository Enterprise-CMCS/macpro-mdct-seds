const timeout = 1000;

const login = require("./OY2-9998-Login");

module.exports = {
  "@tags": ["smoke", "year", "tag1"],

  /*
   * before: function (browser) {
   *   console.log("Setting up the browser instance...");
   *   console.log("Opening the browser...");
   *   browser
   *     .maximizeWindow()
   *     .url(browser.launch_url)
   *     .waitForElementPresent("body");
   *   // Login credentails are pulled from .env files, this file should not be tracked and
   *   // must be stated in the .gitignore file
   *   //Click on Login with EUA ID
   *   browser.useCss().click("button.usa-button[data-testid='LoaderButton']");
   *   const username = browser.globals.user;
   *   const password = browser.globals.pass;
   *   // Loing activities
   *   //browser.useCss().click(".LoginWithOkta .LoaderButton");
   *   browser
   *     .useCss()
   *     .setValue("input#okta-signin-username", username)
   *     .pause(100);
   *   browser
   *     .useCss()
   *     .setValue("input#okta-signin-password", password)
   *     .pause(100);
   *   browser.useCss().click("input#tandc");
   *   browser.useCss().click("input#okta-signin-submit").pause(3000);
   *   browser.waitForElementPresent("body");
   * },
   * after: function (browser) {
   *   console.log("Stopping test executions...");
   *   console.log("Closing down the browser instance...");
   *   browser.end();
   * },
   */
  before: function (browser) {
    login["Login with user"](browser);
  },
  after: function (browser) {
    console.log("Stopping test executions...");
    console.log("Closing down the browser instance...");
    browser.end();
  },

  "Click on year 2021": function (browser) {
    const tests_data = {
      year21: {
        selector: "button[data-testid='accordionButton_2021']",
      },
    };
    browser.click(tests_data.year21.selector).waitForElementPresent("body");
  },

  "Click on Quarter3": function (browser) {
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

  "click on 21PregnantWomen": function (browser) {
    const tests_data = {
      pw: {
        selector: "div[id=row-3] > div > a",
      },
    };
    browser.click(tests_data.pw.selector).waitForElementPresent("body");
    browser.pause(timeout * 3);
  },

  "Fill the 21PregnantWomen form and Save ": function (browser) {
    const tests_data = {
      question1: {
        selector:
          "/html/body/div/div/div[2]/div/div[3]/div/div[2]/div/div[2]/b",
        //selector: "div[id=react-tabs-3] > div > div > div > b",
      },
      question2: {
        selector:
          "/html/body/div/div/div[2]/div/div[3]/div/div[2]/div/div[3]/b",
      },
      question3: {
        selector:
          "/html/body/div/div/div[2]/div/div[3]/div/div[2]/div/div[4]/b",
      },
      question4: {
        selector:
          "/html/body/div/div/div[2]/div/div[3]/div/div[2]/div/div[5]/b",
      },
      question5: {
        selector:
          "/html/body/div/div/div[2]/div/div[3]/div/div[2]/div/div[6]/b",
      },
      question6: {
        selector:
          "/html/body/div/div/div[2]/div/div[3]/div/div[2]/div/div[7]/b",
      },
      question7: {
        selector:
          "/html/body/div/div/div[2]/div/div[3]/div/div[2]/div/div[8]/b",
      },
      question8: {
        selector:
          "/html/body/div/div/div[2]/div/div[3]/div/div[2]/div/div[9]/b",
      },
      question9: {
        selector:
          "/html/body/div/div/div[2]/div/div[3]/div/div[2]/div/div[10]/b",
      },
      summary: {
        selector: "[id=react-tabs-2]",
      },
      age: {
        selector: "div[id=react-tabs-1] > div > h3",
      },
      sumtext: {
        selector: "//*[@id='react-tabs-3']/div/div[1]/h3",
      },
    };
    browser.pause(timeout * 3);
    browser.verify.containsText(
      tests_data.age.selector,
      "Age 19 years through age 64 years"
    );
    browser.pause(timeout * 5);
    //Enter notes and click save on Summary screen
    browser.click(tests_data.summary.selector);
    browser.pause(timeout * 10);
    /*
     * browser.verify.containsText("xpath", tests_data.sumtext.selector, "Summary:");
     * browser.pause(timeout * 5)
     * browser.verify.containsText(tests_data.question1.selector, "What is the unduplicated number of pregnant women ever enrolled during the quarter?");
     */
    browser
      .useXpath()
      .verify.containsText(
        tests_data.question1.selector,
        "1. What is the unduplicated number of pregnant women ever enrolled during the quarter?"
      );
    browser.pause(timeout * 5);
    browser
      .useXpath()
      .verify.containsText(
        tests_data.question2.selector,
        "2. What is the unduplicated number of new enrollees in the quarter?"
      );
    browser.pause(timeout * 3);
    browser
      .useXpath()
      .verify.containsText(
        tests_data.question3.selector,
        "3. What is the unduplicated number of disenrollees in the quarter?"
      );
    browser.pause(timeout * 3);
    browser
      .useXpath()
      .verify.containsText(
        tests_data.question4.selector,
        "4. What is the number of member-months of enrollment for pregnant women in the quarter?"
      );
    browser.pause(timeout * 3);
    browser
      .useXpath()
      .verify.containsText(
        tests_data.question5.selector,
        "5. What is the average number of months of enrollment for pregnant women ever enrolled during the quarter?"
      );
    browser.pause(timeout * 3);
    browser
      .useXpath()
      .verify.containsText(
        tests_data.question6.selector,
        "6. What is the number of pregnant women enrolled at the end of the quarter?"
      );
    browser.pause(timeout * 3);
    browser.useXpath().assert.not.elementPresent(tests_data.question7.selector);
    browser.useXpath().assert.not.elementPresent(tests_data.question8.selector);
    browser.useXpath().assert.not.elementPresent(tests_data.question9.selector);
    browser.pause(timeout * 3);
  },
};
