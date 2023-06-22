//-----Elements-----
const chipStatisticalEnrollmentDataReports =
  "//span[@class='app-title font-alt-xl']";

export class Homepage {
  launch() {
    cy.visit("https://google.com");
  }

  verifyTitle() {
    cy.xpath(chipStatisticalEnrollmentDataReports).should("be.visible");
  }
}
export default Homepage;
