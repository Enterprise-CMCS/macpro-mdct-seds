//const all_text_inputs = "//input[@data-testid='textInput']";
const year2021 = "(//button[@class='usa-accordion__button'])[1]";
const quarterOne = "(//ul[@class='quarterly-items']/li/a)[1]";
const sixtyFourECIFormLink = "(//a)[17]";
const sixtyFourECIFormTitle = "//h2";
const saveButton = "//button[@class='usa-button']";
const textArea = "//textarea[@id='summaryNotesInput']";

export class sixtyFourECIFormPage {
  open64ECIform() {
    cy.xpath(year2021).click();
    cy.wait(2000);
    cy.xpath(quarterOne).click();
    cy.wait(2000);
    cy.xpath(sixtyFourECIFormLink).click();
  }

  verify64ECITitle() {
    cy.xpath(sixtyFourECIFormTitle).should("be.visible");
    cy.xpath(sixtyFourECIFormTitle).contains(
      "Informational Number of Children Served in Medicaid Program"
    );
  }

  enterTextForSummary() {
    cy.xpath(textArea).clear();
    cy.wait(1000);
    cy.xpath(textArea).type("This is a test for Summary section");
  }

  clickSaveButton() {
    cy.xpath(saveButton).click();
  }
}
export default sixtyFourECIFormPage;
