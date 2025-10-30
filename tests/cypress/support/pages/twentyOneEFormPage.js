const all_text_inputs = "//input[@data-testid='textInput']";
const year2021 = "(//button[@class='usa-accordion__button'])[1]";
const quarterOne = "(//ul[@class='quarterly-items']/li/a)[1]";
const twentyoneeFormLink = "(//a)[13]";
const twentyoneeFormTitle = "//h2";
const saveButton = "//button[@class='usa-button']";
const textArea = "//textarea[@id='summaryNotesInput']";
const summaryLink = "//li[@id='react-tabs-10']";
const age0_1Link = "//li[@id='react-tabs-2']";
const age1_5Link = "//li[@id='react-tabs-4']";
const age6_12Link = "//li[@id='react-tabs-6']";
const age13_18Link = "//li[@id='react-tabs-8']";

export class twentyOneEFormPage {
  open21eform() {
    cy.xpath(year2021).click();
    cy.wait(2000);
    cy.xpath(quarterOne).click();
    cy.wait(2000);
    cy.xpath(twentyoneeFormLink).click();
  }

  verify21eTitle() {
    cy.xpath(twentyoneeFormTitle).should("be.visible");
    cy.xpath(twentyoneeFormTitle).contains(
      "Number of Children Served in Separate CHIP Program"
    );
  }

  verifyData1Inputs() {
    cy.xpath(all_text_inputs).each((item, _index, _list) => {
      //expect(list).to.have.length(27);      // number of element item
      cy.wrap(item).scrollIntoView();
      cy.wrap(item).clear();
      cy.wait(100);
      cy.wrap(item).type("10");
      cy.wait(100);
    });
  }

  verifyData2Inputs() {
    cy.xpath(age0_1Link).click();
    cy.wait(1000);
    cy.xpath(all_text_inputs).each((item, _index, _list) => {
      //expect(list).to.have.length(27);      // number of element item
      cy.wrap(item).scrollIntoView();
      cy.wrap(item).clear();
      cy.wait(100);
      cy.wrap(item).type("10");
      cy.wait(100);
    });
  }

  verifyData3Inputs() {
    cy.xpath(age1_5Link).click();
    cy.wait(1000);
    cy.xpath(all_text_inputs).each((item, _index, _list) => {
      //expect(list).to.have.length(27);      // number of element item
      cy.wrap(item).scrollIntoView();
      cy.wrap(item).clear();
      cy.wait(100);
      cy.wrap(item).type("10");
      cy.wait(100);
    });
  }

  verifyData4Inputs() {
    cy.xpath(age6_12Link).click();
    cy.wait(1000);
    cy.xpath(all_text_inputs).each((item, _index, _list) => {
      //expect(list).to.have.length(27);      // number of element item
      cy.wrap(item).scrollIntoView();
      cy.wrap(item).clear();
      cy.wait(100);
      cy.wrap(item).type("10");
      cy.wait(100);
    });
  }

  verifyData5Inputs() {
    cy.xpath(age13_18Link).click();
    cy.wait(1000);
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
export default twentyOneEFormPage;
