import { describe, expect, it, vi } from "vitest";
import { handleExport, buildCsvContents } from "./exportFunctions";
import { saveAs } from "file-saver";

vi.mock("file-saver", () => ({
  saveAs: vi.fn()
}));

const fruitData = {
  columns: [
    { name: "Name", selector: "name" },
    { name: "Count", selector: "count" }
  ],
  data: [
    { name: "apple", count: 3 },
    { name: "orange", count: 5 }
  ]
};

describe("Export Functions", () => {
  describe("CSV Export", () => {
    it("should save a file with the correct name and appropriate MIME type", async () => {
      handleExport("csv", "fruit.csv", fruitData);

      expect(saveAs).toHaveBeenCalled();

      const [blob, fileName] = saveAs.mock.calls[0];
      const [mimeType, ...paramStrings] = blob.type.split(";");

      const [type, subType] = mimeType.split("/");
      expect(type).toBe("text");
      expect(subType).toBe("csv");

      const parameters = Object.fromEntries(
        paramStrings.map(ps => ps.split("="))
      );
      expect(parameters).toHaveProperty("header", "present");
      expect(parameters).toHaveProperty("charset", "utf-8");

      expect(fileName).toBe("fruit.csv");
    });

    it("should save a file with the correct data", async () => {
      const fileContents = buildCsvContents(fruitData);

      expect(fileContents).toBe("Name,Count\r\napple,3\r\norange,5");
    });

    it("should handle undefined properties in the data", async () => {
      const content = {
        columns: [{ name: "Value", selector: "value" }],
        data: [{ value: "foo" }, {}, { value: "bar" }]
      };

      const fileContents = buildCsvContents(content);

      expect(fileContents).toBe("Value\r\nfoo\r\n\r\nbar");
    });

    it("should properly escape fields when necessary", async () => {
      const content = {
        columns: [
          { name: "Test Case", selector: "name" },
          { name: "Value", selector: "data" }
        ],
        data: [
          { name: "has_comma", data: "a, b" },
          { name: "has_line_feed", data: "c\nd" },
          { name: "has_carriage_return", data: "e\rf" },
          { name: "has_comma_and_quote", data: `g:"h,i"` }
        ]
      };

      const fileContents = buildCsvContents(content);

      const lines = fileContents.split("\r\n");
      expect(lines[1]).toBe(`has_comma,"a, b"`);
      expect(lines[2]).toBe(`has_line_feed,"c\nd"`);
      expect(lines[3]).toBe(`has_carriage_return,"e\rf"`);
      expect(lines[4]).toBe(`has_comma_and_quote,"g:""h,i"""`);
    });

    it("should throw error from export if the type is a pdf", async () => {
      await expect(handleExport("pdf", "mock-name")).rejects.toThrow(
        "PDF export failed! Error code 10f2c"
      );
    });
  });
});
