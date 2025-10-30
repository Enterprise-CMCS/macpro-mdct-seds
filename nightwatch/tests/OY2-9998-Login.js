module.exports = {
  "Login with user": function (browser) {
    console.log("Setting up the browser instance...");
    console.log("Opening the browser...");
    browser
      .maximizeWindow()
      .url(browser.launch_url)
      .waitForElementPresent("body");
    /*
     * Login credentails are pulled from .env files, this file should not be tracked and
     * must be stated in the .gitignore file
     * Click on Login with EUA ID
     */
    browser.useCss().click("button.usa-button[data-testid='LoaderButton']");
    const username = browser.globals.user;
    const password = browser.globals.pass;
    /*
     * Loing activities
     * browser.useCss().click(".LoginWithOkta .LoaderButton");
     */
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

  "Logout with user": function (browser) {
    console.log("Stopping test executions...");
    console.log("Closing down the browser instance...");
    browser.end();
  },
};
