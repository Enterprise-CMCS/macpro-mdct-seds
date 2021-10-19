import { Given } from "cypress-cucumber-preprocessor/steps";
import Homepage from "../../support/pages/Homepage";

const homePage = new Homepage();

Given("user visits google home page", () => {
    homePage.launch();
});
