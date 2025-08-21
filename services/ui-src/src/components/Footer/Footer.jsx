import React from "react";
import { FooterNav, Grid, GridContainer } from "@trussworks/react-uswds";
import "./Footer.scss";

const Footer = () => {
  return (
    <div className="footer position-relative z-bottom" data-testid="Footer">
      <GridContainer className="container" containerSize="none">
        <Grid row>
          <Grid col={6} tablet={{ col: true }}>
            <div className="logo">
              <ul>
                <li>
                  <img
                    src="/img/seds-logo.svg"
                    alt="MDCT SEDS: Statistical Enrollment Data Systems, Medicaid Data Collection Tool"
                  />
                </li>
              </ul>
            </div>

            <div className="tagline">
              Centers for Medicare &amp; Medicaid Services
            </div>
          </Grid>
          <Grid col={6} tablet={{ col: true }}>
            <div className="footer-nav">
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
            </div>
            <div className="info">
              <div className="help">
                <p>
                  Email{" "}
                  <a
                    data-test="attribute-email"
                    href="mailto:mdct_help@cms.hhs.gov"
                  >
                    MDCT_Help@cms.hhs.gov
                  </a>{" "}
                  for help or feedback.
                </p>
              </div>
              <div className="title">
                A federal government managed website by the Centers for Medicare
                &amp; Medicaid Services
              </div>
            </div>
          </Grid>
        </Grid>
      </GridContainer>
      <div className="address">7500 Security Boulevard Baltimore, MD 21244</div>
    </div>
  );
};

export default Footer;
