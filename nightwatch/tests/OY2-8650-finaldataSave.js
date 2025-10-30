const timeout = 1000;

const login = require("./OY2-9998-Login");

module.exports = {
  "@tags": ["smoke", "year", "tag1"],

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
   *   // Login activities
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

  "click on 21E": function (browser) {
    const tests_data = {
      chip: {
        selector: "div[id=row-0] > div > a",
      },
    };
    browser.click(tests_data.chip.selector).waitForElementPresent("body");
  },

  "Fill the 21E form and Save ": function (browser) {
    const tests_data = {
      fpl: {
        selector: "div[data-testid=textInput]",
      },
      ffs: {
        selector: "input[data-testid=textInput]",
      },
      fplchangebutton: {
        selector: "button[data-testid=button]",
      },
      number: {
        selector: "input[type=number]",
      },
      save: {
        selector: "button[data-testid=saveButton]",
      },
      age: {
        selector: "div[id=react-tabs-1] > div > h3",
      },
      provtext: {
        selector: "div[data-testid=alert] > div > h3",
      },
      summary: {
        //selector: "/html/body/div/div/div[2]/div/div[3]/div/ul/li[6]",
        selector: "[id=react-tabs-10]",
      },
      notes: {
        selector: "[id=summaryNotesInput]",
      },
      certification: {
        selector: "/html/body/div/div/div[2]/div/div[3]/div/ul/li[7]",
      },
      final: {
        selector:
          "/html/body/div/div/div[2]/div/div[3]/div/div[7]/div/div[4]/button[2]",
        /*
         * *[@id="react-tabs-27"]/div/div[4]/button[2]
         * *[@id="react-tabs-13"]/div/div[4]/button[2]
         */
      },
      provisional: {
        selector: "//*[@id='react-tabs-5']/div/div[4]/button[1]",
      },
      uncertify: {
        selector:
          "/html/body/div/div/div[2]/div/div[3]/div/div[7]/div/div[6]/button",
        /*
         * *[@id="react-tabs-23"]/div/div[6]/button
         * /html/body/div/div/div[2]/div/div[3]/div/div[7]/div/div[6]/button
         * *[@id="react-tabs-5"]/div/div[6]/button
         * /html/body/div/div/div[2]/div/div[3]/div/div[3]/div/div[6]/button
         */
      },
    };
    browser.verify.containsText(tests_data.age.selector, "Conception to birth");
    browser.pause(timeout * 3);

    browser.elements(
      "xpath",
      "//*[@data-testid='textInput']",
      function (link_array) {
        link_array.value.forEach(function (element, index) {
          let ele = element.ELEMENT;
          browser.elementIdEnabled(ele, function (result) {
            if (result.value == true) {
              browser.elementIdClear(ele);
              browser.elementIdValue(ele, index);
            }
          });
        });
      }
    );
    const valueContains = function () {
      browser.verify.valueContains(tests_data.number.selector, "315");
      browser.click(tests_data.fplchangebutton.selector);
    };

    browser.clearValue(tests_data.number.selector);
    browser.setValue(tests_data.number.selector, "315", valueContains);
    //browser.click(tests_data.save.selector);
    browser.pause(timeout * 7);

    /*
     * Enter notes and click save on Summary screen
     * browser.click("xpath", tests_data.summary.selector);
     */
    browser.click(tests_data.summary.selector);
    browser.clearValue(tests_data.notes.selector);
    browser.setValue(tests_data.notes.selector, "This is a test");
    browser.click(tests_data.save.selector);
    browser.pause(timeout * 7);

    //Click on certify and submit final data and make necessary changes to the form

    browser.click("xpath", tests_data.certification.selector);
    browser.click("xpath", tests_data.final.selector);
    browser.pause(timeout * 6);
    browser.verify.containsText(
      tests_data.provtext.selector,
      "Thank you for submitting your SEDS data!"
    );
    //browser.expect.element("xpath", tests_data.provtext.selector).text.to.contain("This report was updated to Final Data Certified and Submitted");
    browser.pause(timeout * 8);
    browser.click(tests_data.summary.selector);
    browser.pause(timeout * 6);
    browser.expect.element(tests_data.notes.selector).to.not.be.enabled;
    //browser.expect.element(tests_data.number.selector).to.not.be.enabled;
    browser.pause(timeout * 5);
    browser.click("xpath", tests_data.certification.selector);
    browser.pause(timeout * 5);
    browser.click("xpath", tests_data.uncertify.selector);
    browser.acceptAlert();
    browser.pause(timeout * 6);
  },
};
