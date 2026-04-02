import { saveAs } from "file-saver";

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

export const handleExport = async (fileName, content) => {
  const fileContents = buildCsvContents(content);
  const blob = new Blob([fileContents], {
    type: "text/csv;charset=utf8;header=present",
  });
  saveAs(blob, fileName);
};
