//
const all_text_inputs = "//input[@data-testid='textInput']";
const year2021 = "(//button[@class='usa-accordion__button'])[1]";
const quarterOne = "(//ul[@class='quarterly-items']/li/a)[1]";
const greFormLink = "(//a)[7]";
const greTitle = "//h2";
const saveButton = "//button[@class='usa-button']";
const textArea = "//textarea[@id='summaryNotesInput']";
const summaryLink = "(//ul[@class='react-tabs__tab-list']/li)[2]";

export class GREFormPage {
  openGREform() {
    cy.xpath(year2021).click();
    cy.wait(2000);
    cy.xpath(quarterOne).click();
    cy.wait(2000);
    cy.xpath(greFormLink).click();
  }

  verifyGREtitle() {
    cy.xpath(greTitle).should("be.visible");
    cy.xpath(greTitle).contains("Gender, Race & Ethnicity");
  }

  verifyDataInputs() {
    cy.xpath(all_text_inputs).each((item, _index, _list) => {
      //expect(list).to.have.length(27);      // number of element item
      cy.wrap(item).scrollIntoView();
      cy.wrap(item).clear();
      cy.wait(100);
      cy.wrap(item).type("10");
      cy.wait(100);
    });
  }

  enterTextForSummary() {
    cy.xpath(summaryLink).click();
    cy.xpath(textArea).clear();
    cy.wait(1000);
    cy.xpath(textArea).type("This is a test for Summary section");
  }

  clickSaveButton() {
    cy.xpath(saveButton).click();
  }
}
export default GREFormPage;
