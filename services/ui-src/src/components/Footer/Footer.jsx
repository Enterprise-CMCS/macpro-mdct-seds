import React from "react";

const Footer = () => {
  return (
    <footer className="footerRoot" data-testid="Footer">
      <div className="footerTop">
        <div className="footerTopContainer" containerSize="none">
          <div row className="footerTopFlex">
            <div className="footerTopLeftContainer">
              <img
                className="sedsLogo"
                src="/img/seds-logo.svg"
                alt="MDCT SEDS: Statistical Enrollment Data Systems, Medicaid Data Collection Tool"
              />
            </div>
            <div className="footerTopRightContainer">
              <div className="footerTopRightTopFlex">
                <div className="footerCMSBrandingLeft">
                  <div className="hhsLogo">
                    <img
                      src="/img/logo_hhs.svg"
                      alt="Department of Health and Human Services, USA"
                    />
                  </div>
                  <div className="hhsMedicaidLogoMobile">
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
              <div className="footerCMSMedicaid">
                <div className="medicaidLogo">
                  <img
                    src="/img/logo_medicaid.svg"
                    alt="Medicaid.gov: Keeping America Healthy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footerBottom">
        <div className="footerBottomContainer">
          <div className="footerBottomFlex">
            <div className="footerBottomLinkFlex">
              <a href="mailto:mdct_help@cms.hhs.gov">Contact Us</a>
              <a
                href="https://www.cms.gov/About-CMS/Agency-Information/Aboutwebsite/CMSNondiscriminationNotice"
                target="_blank"
              >
                Accessibility Statement
              </a>
            </div>
            <div className="addressDiv">
              <p className="address">
                7500 Security Boulevard Baltimore, MD 21244
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
