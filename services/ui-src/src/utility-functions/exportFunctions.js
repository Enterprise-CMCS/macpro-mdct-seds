import { exportToExcel } from "../libs/api";
import { renderToString } from "react-dom/server";

import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";

export const handleExcelExport = async (fileName, content) => {
  let buffer, blob;

  buffer = await exportToExcel(content);
  // *** lambdas will convert buffer to Int32Array
  // *** we are going to instantiate Uint8Array (binary) buffer
  // *** to avoid having to care about MIME type of file we're saving
  buffer = new Uint8Array(buffer.data).buffer;

  // *** save file as blob
  blob = new Blob([buffer]);
  saveAs(blob, fileName);
};

export const handlePdfExport = (
  fileName,
  pdfContent = null,
  pdfContentType = "react-component"
) => {
  let pdf, pdfToExport;

  // *** do additional processing depending on content type
  switch (pdfContentType) {
    // *** if element is a react component, render it to html string
    case "react-component":
      pdfToExport = renderToString(pdfContent);
      break;

    // *** for content to be extracted from html selectors ...
    case "html-selector":
      // * ... temporarily add class to container prior to initiating render to pdf
      // * this will enable overrides from scss
      document.querySelector(pdfContent).classList.add("export-to-pdf");
      // * remove selector initially passed temporarily to minimize style clashes
      document.querySelector(".export-to-pdf").classList.remove(pdfContent);

      // * store content to render to pdf
      pdfToExport = document.querySelector(".export-to-pdf");

      // * remove temporarily added class from content element
      setTimeout(() => {
        document.querySelector(".export-to-pdf").classList.add(pdfContent);
        document.querySelector(pdfContent).classList.remove("export-to-pdf");
      }, 250);
      break;

    case "html":
      pdfToExport = pdfContent;
      break;

    default:
      // *** no default behavior is currently specified
      break;
  }

  // *** initiate pdf render
  pdf = new jsPDF({
    unit: "px",
    format: "letter",
    userUnit: "px",
    orientation: "landscape"
  });

  pdf
    .html(pdfToExport, {
      html2canvas: { scale: 0.33 }
    })
    .then(() => {
      pdf.save(fileName);
    });
};

export const handleExport = async (
  format,
  fileName,
  content,
  pdfContentType = "react-component"
) => {
  switch (format) {
    case "excel":
      await handleExcelExport(fileName, content);
      break;

    case "pdf":
      handlePdfExport(fileName, content, pdfContentType);
      break;

    default:
      // *** no default behavior currently specified
      break;
  }
};
