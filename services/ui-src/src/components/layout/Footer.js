import React from "react";
import { FooterNav, Grid, GridContainer } from "@trussworks/react-uswds";

const Footer = () => {
  return (
    <div className="footer">
      <GridContainer className="container">
        <Grid row>
          <Grid col={6} tablet={{ col: true }}>
            <div className="logo">
              <img
                src="/img/logo-cms.png"
                alt="Centers for Medicare and Medicaid Services"
              />
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
                  <a className="usa-footer__primary-link" href="/faq">
                    FAQs
                  </a>,
                  <a className="usa-footer__primary-link" href="/contact">
                    Contact
                  </a>,
                  <a
                    className="usa-footer__primary-link"
                    href="https://www.cms.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Centers for Medicare &amp; Medicaid Services
                  </a>
                ]}
              />
            </div>
            <div className="info">
              <div className="title">
                A federal government managed website by the Centers for Medicare
                &amp; Medicaid Services
              </div>
              <div className="address">
                2500 Security Boulevard Baltimore, MD 21244
              </div>
            </div>
          </Grid>
        </Grid>
      </GridContainer>
    </div>
  );
};

export default Footer;
