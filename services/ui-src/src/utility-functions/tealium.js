const MAX_RETRY = 5;
let lastUrl = "";

export const fireTealiumPageView = (isAuthenticated, url, pathname) => {
  /**
   * This double-fires on the re-route from / to /login when unauthenticated or logging out
   * - url (from window.location.href) and pathname (from react location hook) can be out of sync
   * - url will be the new location in both instances, pathname will be one for each
   * - We only want to consume one of them.
   *  */
  if (url === lastUrl) return;
  lastUrl = url;

  const isReportPage = pathname.includes("form");
  const contentType = isReportPage ? "form" : "app";
  const sectionName = isReportPage ? pathname.split("/")[1] : "main app";
  const tealiumEnvMap = {
    "mdctseds.cms.gov": "production", // Different than the url value (index.html)
    "mdctsedsval.cms.gov": "qa",
  };
  const tealiumEnv = tealiumEnvMap[window.location.hostname] || "dev";
  const { host: siteDomain } = url ? new URL(url) : null;
  sendView({
    content_language: "en",
    content_type: contentType,
    page_name: sectionName + ":" + pathname,
    page_path: pathname,
    site_domain: siteDomain,
    site_environment: tealiumEnv,
    site_section: sectionName,
    logged_in: isAuthenticated,
  });
};

const sendView = (view, retry = 0) => {
  if (window.utag) {
    window.utag.view(view);
  } else if (retry <= MAX_RETRY) {
    setTimeout(() => {
      sendView(view, retry + 1);
    }, 250);
  }
};
