import React from "react";
import { Grid, GridContainer } from "@trussworks/react-uswds";
import "./Footer.scss";

const Footer = () => {
  return (
    <div className="root" data-testid="Footer" role="contentinfo">
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
            <div className="footerTopRightContainer">
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
              <div className="footerCMSBrandingRight">
                <p className="hhsCopyText">
                  A federal government website managed and paid for by the
                  U.S. Centers for Medicare and Medicaid Services and part of
                  the MDCT suite.
                </p>
              </div>
            </div>
          </Grid>
        </Grid>
      </GridContainer>
      {/* update styling from here */}
      <div className="footerBottom">
        <div className="footerBottomContainer">
          <div className="footerBottomFlex">
            <div className="footerBottomLinkFlex">
              <a href="https://www.cms.gov/help" target="_blank" className="link">
                Contact Us
              </a>
              <a
                href="https://www.cms.gov/About-CMS/Agency-Information/Aboutwebsite/CMSNondiscriminationNotice"
                target="_blank"
                className="link"
              >
                Accessibility Statement
              </a>
            </div>
            <div>
              <p className="address">
                7500 Security Boulevard Baltimore, MD 21244
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
