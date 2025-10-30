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

  "Click on Quarter1": function (browser) {
    const tests_data = {
      quarter1: {
        selector: "div[data-testid='accordionItem_2021'] > ul > li > a",
      },
    };
    browser.click(tests_data.quarter1.selector).waitForElementPresent("body");
  },

  "click on GRE": function (browser) {
    const tests_data = {
      pw: {
        selector: "div[id='row-4'] > div > a",
      },
    };
    browser.click(tests_data.pw.selector).waitForElementPresent("body");
    browser.pause(timeout * 5);
  },

  "Fill the GRE form, Update FPL changes, Save and Return to EnrollmentDataHome":
    function (browser) {
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
        gre: {
          //selector: "/html/body/div/div/div[2]/div/div[1]/div[2]/div[1]/h2",
          selector: "//*[@id='root']/div/div[2]/div/div[1]/div[2]/div[1]/h2",
        },
      };
      browser.pause(timeout * 5);
      //browser.useXpath().verify.containsText( tests_data.gre.selector, "Gender, Race & Ethnicity");
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

      browser.click(tests_data.save.selector);
      browser.click(tests_data.footer.selector);
      browser.pause(timeout * 5);
    },
};
