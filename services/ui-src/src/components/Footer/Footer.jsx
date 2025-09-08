import { FooterNav, Grid, GridContainer } from "@trussworks/react-uswds";
import "./Footer.scss";

const Footer = () => {
  return (
    <div className="footer" data-testid="Footer" role="contentinfo">
      <GridContainer className="footerTop" containerSize="none">
        <Grid row className="footerTopContainer">
          <Grid col={6} tablet={{ col: true }} className="footerTopFlex">
            <div className="footerTopLeftContainer">
              <img
                className="sedsLogo"
                src="/img/seds-logo.svg"
                alt="MDCT SEDS: Statistical Enrollment Data Systems, Medicaid Data Collection Tool"
              />
            </div>

          </Grid>
          <Grid col={6} tablet={{ col: true }}>
            <div className="footerTopContainer">
              <div className="footerTopRightTopFlex">
                <div className="hhsLogo">
                  <img
                      src="/img/logo_hhs.svg"
                      alt="Department of Health and Human Services, USA"
                  />
                </div>
                <div className="medicaidLogo">
                  <img
                      src="/img/logo_medicaid.svg"
                      alt="Medicaid.gov: Keeping America Healthy"
                  />
                </div>
              </div>
              <div className="hhsCopyText">
                A federal government managed website by the Centers for Medicare
                &amp; Medicaid Services
              </div>
            </div>
          </Grid>
        </Grid>
      </GridContainer>
      {/* <div className="footer-nav">
              <FooterNav
                aria-label="Footer navigation"
                size="slim"
                links={[
                  <a
                    className="usa-footer__primary-link"
                    href="https://www.cms.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Centers for Medicare &amp; Medicaid Services Website
                  </a>
                ]}
              />
            </div> */}
      <div className="address">7500 Security Boulevard Baltimore, MD 21244</div>
    </div>
  );
};

export default Footer;
