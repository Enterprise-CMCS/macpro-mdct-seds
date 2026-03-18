import { renderToString } from "react-dom/server";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";

/**
 * Converts the given data to CSV format, and saves it to file.
 *
 * This implementation is compliant with RFC 7111:
 *  - When a cell contains a character that could cause ambiguity,
 *    it is escaped with double quotes.
 *  - Newlines are CRLF (0x0A0D).
 *  - MIME type indicates encoding and header row (optional, but encouraged).
 * @param {string} fileName
 * @param {{ columns: { name: string, selector: string }[], data: any[] }} content
 */
export const buildCsvContents = (content) => {
  const escape = (value) => {
    const str = value?.toString() ?? "";
    return /[\r\n,]/.test(str) ? `"${str.replaceAll('"', '""')}"` : str;
  };
  const createRow = (arr) => arr.map(escape).join(",");

  const { columns, data } = content;
  const headers = columns.map((col) => col.name);
  const body = data.map((row) => columns.map((col) => row[col.selector]));
  const rows = [createRow(headers), ...body.map(createRow)];

  return rows.join("\r\n");
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
    orientation: "landscape",
  });

  pdf
    .html(pdfToExport, {
      html2canvas: { scale: 0.33 },
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
  let fileContents;
  let blob;
  switch (format) {
    case "csv":
      fileContents = buildCsvContents(content);
      blob = new Blob([fileContents], {
        type: "text/csv;charset=utf-8;header=present",
      });
      saveAs(blob, fileName);
      break;

    case "pdf":
      // To fix the PDf export, delete this throw, and this comment.
      // If the year is 2026 or later,
      // and you are trying to test a version bump PR for jspdf or html2canvas,
      // and there haven't been any support tickets about the broken PDF export,
      // you have the opportunity to do something great instead:
      // * Delete the PDF print button from Users.jsx
      // * Delete all PDF-related code from this file
      // * Uninstall jspdf and html2canvas
      // * Delete the HTMLCanvas.getContext() override from setupTests.js
      // * Tell no one
      throw new Error("PDF export failed! Error code 10f2c");
      handlePdfExport(fileName, content, pdfContentType); // oxlint-disable-line no-unreachable
      break; // oxlint-disable-line no-unreachable

    default:
      // *** no default behavior currently specified
      break;
  }
};
