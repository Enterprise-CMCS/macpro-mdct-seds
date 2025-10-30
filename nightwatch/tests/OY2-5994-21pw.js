const path = require("path");
const timeout = 1000;

const mySelector = "//*[@data-testid='textInput']";
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

  "Click on Quarter1": function (browser) {
    const tests_data = {
      quarter1: {
        selector: "div[data-testid='accordionItem_2021'] > ul > li > a",
      },
    };
    browser.click(tests_data.quarter1.selector).waitForElementPresent("body");
  },

  "click on 21PregnantWomen": function (browser) {
    const tests_data = {
      pw: {
        selector: "div[id=row-0] > div > a",
      },
    };
    browser.click(tests_data.pw.selector).waitForElementPresent("body");
  },

  "Fill the 21PregnantWomen form and Save ": function (browser) {
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
        selector: "[id=react-tabs-0]",
      },
      footer: {
        selector: "div[data-testid=grid] > a",
      },
    };
    browser.verify.containsText(tests_data.age.selector, "Ages 19");

    //working
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

    /*
     * working
     *      browser.elements("xpath", "//*[@data-testid='textInput']", function(link_array) {
     *      for (var x = 0; x < link_array.value.length; x++){
     *          let ele = link_array.value[x].ELEMENT;
     *          browser.elementIdEnabled(ele, function(result) {
     *              if(result.value == true){
     *                  browser.elementIdClear(ele);
     *                  browser.elementIdValue(ele, "5");
     *              }
     *          });
     *      }
     *    });
     */

    const valueContains = function () {
      browser.verify.valueContains(tests_data.number.selector, "315");
      browser.click(tests_data.fplchangebutton.selector);
    };

    browser.clearValue(tests_data.number.selector);
    browser.setValue(tests_data.number.selector, "315", valueContains);
    const myAssert = function (any) {
      browser.assert.attributeContains(ffs, "textInput");
    };
    browser.click(tests_data.save.selector);

    browser.click(tests_data.footer.selector);
    browser.pause(timeout * 5);
  },
};
