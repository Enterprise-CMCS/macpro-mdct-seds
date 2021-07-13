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
    // Loing activities
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

  "Click on year 2021": function (browser){

    const tests_data = {
        year21: {
          selector: "button[data-testid='accordionButton_2021'] ",
        },
      };
      browser.click(tests_data.year21.selector).waitForElementPresent("body");

  },

  "Click on Quarter1": function (browser) {
    const tests_data = {
      quarter1: {
        selector: "div[data-testid='accordionItem_2021'] > ul > li > a",
      },
    };
    browser.click(tests_data.quarter1.selector).waitForElementPresent("body");
  },

  "click on 21E": function (browser) {
    const tests_data = {
      pw: {
        selector: "div[id=row-3] >div>a",
      },
    };
    browser.click(tests_data.pw.selector).waitForElementPresent("body");
  },

  "Fill the 21E form, Update FPL changes, Save and Return to EnrollmentDataHome": function (
    browser
  ) {
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
        selector: "input[id=max-fpl]",
      },
      save: {
        selector: "button[data-testid=saveButton]",
      },
      age0: {
        selector: "div[id=react-tabs-1] > div > h3",
      },
      age1tab: {
        selector: "[id=react-tabs-2]",
      },
      age1: {
        selector: "div[id=react-tabs-3] > div > h3",
      },
      age5tab: {
        selector: "[id=react-tabs-4]",
      },
      age5: {
        selector: "div[id=react-tabs-5] > div > h3",
      },
      age12tab: {
        selector: "[id=react-tabs-6]",
      },
      age12: {
        selector: "div[id=react-tabs-7] > div > h3",
      },
      age18tab: {
        selector: "[id=react-tabs-8]",
      },
      age18: {
        selector: "div[id=react-tabs-9] > div > h3",
      },
      footer: {
        selector: "div[data-testid=grid] > a",
      },
      total1: {
        selector:
          "/html/body/div/div/div[2]/div/div[3]/div/div[1]/div[2]/div/table/tbody/tr[4]/td[6]",
      },
    };
    browser.verify.containsText(
      tests_data.age0.selector,
      "Conception to birth"
    );
    browser.pause(timeout * 5);
    browser.clearValue(tests_data.number.selector);
    const valueContains = function () {
      browser.verify.valueContains(tests_data.number.selector, "320");
      browser.click(tests_data.fplchangebutton.selector);
    };

    browser.setValue(tests_data.number.selector, "320", valueContains);
    const myAssert = function (any) {
      browser.assert.attributeContains(ffs, "textInput");
    };

    let total = 0;
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
              if (index > 0 && index < 13) {
                total = total + index;
                //console.log("total-" , total);
              }
            }
          });
        });
      }
    );

    //browser.useXpath().verify.containsText( tests_data.total1.selector , total);
    browser.click(tests_data.save.selector);

    //Ages 0-1 :
    browser.click(tests_data.age1tab.selector);
    browser.verify.containsText(
      tests_data.age1.selector,
      "Birth through age 12 months"
    );
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
    browser.click(tests_data.save.selector);

    //Ages 1-5 :
    browser.click(tests_data.age5tab.selector);
    browser.verify.containsText(
      tests_data.age5.selector,
      "Age 1 year through age 5 years"
    );
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
    browser.click(tests_data.save.selector);

    //Ages 6-12 :
    browser.click(tests_data.age12tab.selector);
    browser.verify.containsText(
      tests_data.age12.selector,
      "Age 6 years through age 12 years"
    );
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
    browser.click(tests_data.save.selector);

    //Ages 13-18 :
    browser.click(tests_data.age18tab.selector);
    browser.verify.containsText(
      tests_data.age18.selector,
      "Age 13 years through age 18 years"
    );
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
    //working
    //     browser.elements("xpath", "//*[@data-testid='textInput']", function(link_array) {
    //     for (var x = 0; x < link_array.value.length; x++){
    //         let ele = link_array.value[x].ELEMENT;
    //         browser.elementIdEnabled(ele, function(result) {
    //             if(result.value == true){
    //                 browser.elementIdClear(ele);
    //                 browser.elementIdValue(ele, "5");
    //             }
    //         });
    //     }
    //   });

    //browser.assert.elementPresent( tests_data.total1.selector);
    //browser.verify.containsText("xpath", "//*[@id='AL-2021-1-64.EC-0001-01']/table/tbody/tr[4]/td[6]");
    //   browser.click("[id=react-tabs-0]");
    //   browser.element("xpath", "/html/body/div/div/div[2]/div/div[3]/div/div[1]/div[2]/div/table/tbody/tr[4]/td[6]", function(elements) {
    //     console.log("total-" , total);
    //     browser.useXpath().verify.containsText( tests_data.total1.selector , total);
    //     //console.log("elements-" , elements);
    //   //console.log("elements-" , elements.value[0].ELEMENT);
    // });

    browser.click(tests_data.save.selector);
    browser.click(tests_data.footer.selector);
    browser.pause(timeout * 5);
  },
};
