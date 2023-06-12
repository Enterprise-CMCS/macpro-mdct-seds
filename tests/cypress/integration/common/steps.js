//import { Given } from "cypress-cucumber-preprocessor/steps";
import { And, Given, Then, When } from "cypress-cucumber-preprocessor/steps";
import GREFormPage from "../../support/pages/GREFormPage";
import Homepage from "../../support/pages/Homepage";
import sixtyFourECFormPage from "../../support/pages/sixtyFourECFormPage";
import twentyOnePWFormPage from "../../support/pages/twentyOnePWFormPage";
import Loginpage from "../../support/pages/Loginpage";
import twentyOneEFormPage from "../../support/pages/twentyOneEFormPage";
import sixtyFourTwentyOneEFormPage from "../../support/pages/sixtyFourTwentyOneEFormPage";
import sixtyFourECIFormPage from "../../support/pages/sixtyFourECIFormPage";

const homePage = new Homepage();
const loginpage = new Loginpage();
const greformpage = new GREFormPage();
const sixtyfourecformpage = new sixtyFourECFormPage();
const twentyonepwformpage = new twentyOnePWFormPage();
const twentyoneeformpage = new twentyOneEFormPage();
const sixtyfourtwentyoneeformpage = new sixtyFourTwentyOneEFormPage();
const sixtyfoureciformpage = new sixtyFourECIFormPage();

Given("user visits google home page", () => {
  homePage.launch();
});

Given("user visits SEDS home page", () => {
  loginpage.launch();
});

And("logins with valid username and password", () => {
  loginpage.clickEuaIDbutton();
  loginpage.enterUserName();
  loginpage.enterPassword();
  loginpage.clickAgreeTermAndConditions();
  loginpage.clickSignIn();
});

And("user can see SEDS landing page", () => {
  homePage.verifyTitle();
});

Given("user click on year 2021 Quarter 1 GRE", () => {
  greformpage.openGREform();
});

When("user can see the GRE form title", () => {
  greformpage.verifyGREtitle();
});

Then("user fill out the GRE form ages 0-18", () => {
  greformpage.verifyDataInputs();
});

And("user click on Save button", () => {
  greformpage.clickSaveButton();
});

And("user fill out GRE Summary section", () => {
  greformpage.enterTextForSummary();
});

Given("user click on year 2021 Quarter 1 64.EC", () => {
  sixtyfourecformpage.open64ecform();
});

When("user can see the 64.EC form title", () => {
  sixtyfourecformpage.verify64ecTitle();
});

Then("user fill out the 64.EC form ages 0-1", () => {
  sixtyfourecformpage.verifyData1Inputs();
});

And("user fill out the 64.EC form ages 1-5", () => {
  sixtyfourecformpage.verifyData2Inputs();
});

And("user fill out the 64.EC form ages 6-12", () => {
  sixtyfourecformpage.verifyData3Inputs();
});

And("user fill out the 64.EC form ages 13-18", () => {
  sixtyfourecformpage.verifyData4Inputs();
});

And("user fill out the 64.EC form ages 19-20", () => {
  sixtyfourecformpage.verifyData5Inputs;
});

And("user fill out the 64.EC Summary section", () => {
  sixtyfourecformpage.enterTextForSummary();
});

Given("user click on year 2021 Quarter 1 21PW", () => {
  twentyonepwformpage.open21pwform();
});

When("user can see the 21PW form title", () => {
  twentyonepwformpage.verify21pwTitle();
});

Then("user fill out the 21PW form ages 19-64", () => {
  twentyonepwformpage.verifyData1Inputs();
});

And("user fill out the 21PW Summary section", () => {
  twentyonepwformpage.enterTextForSummary();
});

Given("user click on year 2021 Quarter 1 21E", () => {
  twentyoneeformpage.open21eform();
});

When("user can see the 21E form title", () => {
  twentyoneeformpage.verify21eTitle();
});

Then("user fill out the 21E form under age 0", () => {
  twentyoneeformpage.verifyData1Inputs();
});

And("user fill out the 21E form ages 0-1", () => {
  twentyoneeformpage.verifyData2Inputs();
});

And("user fill out the 21E form ages 1-5", () => {
  twentyoneeformpage.verifyData3Inputs();
});

And("user fill out the 21E form ages 6-12", () => {
  twentyoneeformpage.verifyData4Inputs();
});

And("user fill out the 21E form ages 13-18", () => {
  twentyoneeformpage.verifyData5Inputs();
});

And("user fill out the 21E Summary section", () => {
  twentyoneeformpage.enterTextForSummary();
});

Given("user click on year 2021 Quarter 1 64.21E", () => {
  sixtyfourtwentyoneeformpage.open6421eform();
});

When("user can see the 64.21E form title", () => {
  sixtyfourtwentyoneeformpage.verify6421eTitle();
});

Then("user fill out the 64.21E form ages 0-1", () => {
  sixtyfourtwentyoneeformpage.verifyData1Inputs();
});

And("user fill out the 64.21E form ages 1-5", () => {
  sixtyfourtwentyoneeformpage.verifyData2Inputs();
});

And("user fill out the 64.21E form ages 6-12", () => {
  sixtyfourtwentyoneeformpage.verifyData3Inputs();
});

And("user fill out the 64.21E form ages 13-18", () => {
  sixtyfourtwentyoneeformpage.verifyData4Inputs();
});

And("user fill out the 64.21E Summary section", () => {
  sixtyfourtwentyoneeformpage.enterTextForSummary();
});

Given("user click on year 2021 Quarter 1 64.ECI", () => {
  sixtyfoureciformpage.open64ECIform();
});

When("user can see the 64.ECI form title", () => {
  sixtyfoureciformpage.verify64ECITitle();
});

Then("user fill out the 64.ECI Summary section", () => {
  sixtyfoureciformpage.enterTextForSummary();
});
