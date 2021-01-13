module.exports = {
  "My first test case"(browser) {
    browser
      .url(`${process.env.APPLICATION_ENDPOINT}`)
      .waitForElementVisible(".header")
      .assert.containsText(
        ".page-title",
        "CHIP Statistical Enrollment Data Reports"
      )
      .saveScreenshot("tests_output/My_first_test_case_screenshot.png");
  },
};
