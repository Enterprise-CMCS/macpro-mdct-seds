import { describe, expect, test } from "vitest";
import jsonpath from "jsonpath";
import {
  sortQuestionsByNumber,
  extractAgeRanges,
  formatAnswerData,
  insertAnswer,
  insertFPL,
  clearSingleQuestion
} from "./helperFunctions";

import { answers, questions } from "./singleFormTestVariables";

describe("Single Form Reducer, helper functions", () => {
  test("sortQuestionsByNumber should sort an unordered array of questions", () => {
    const sortedQuestions = questions.sort(sortQuestionsByNumber);
    expect(sortedQuestions[0].question.slice(-2)).toEqual("01");
  });

  test("extractAgeRanges should return all age ranges present in an array of answers", () => {
    const foundAges = extractAgeRanges(answers);
    expect(foundAges).toContain("0612");
    expect(foundAges).toContain("0105");
  });

  test("formatAnswerData should take in an array of numbers and sort them by row and column", () => {
    let inputFromLocalState = [
      null,
      null,
      [null, null, 1, 2, 3, 4, 5],
      [null, null, 6, 7, 8, 9, 10],
      [null, null, 3, 6, 9, 12, 15]
    ];
    let formattedData = formatAnswerData(inputFromLocalState);
    expect(formattedData[0].col2).toEqual(1);
    expect(formattedData[0].col4).toEqual(3);
    expect(formattedData[0].col6).toEqual(5);
  });
  test("insertAnswer should take in rows of answer data and return an answer array with the rows appropriately placed", () => {
    const rowsOfAnswerData = [
      {
        col2: 5,
        col3: 10,
        col4: 15,
        col5: 20,
        col6: 25
      },
      {
        col2: 7,
        col3: 14,
        col4: 21,
        col5: 28,
        col6: 35
      },
      {
        col2: 8,
        col3: 16,
        col4: 24,
        col5: 32,
        col6: 40
      }
    ];

    const updatedAnswers = insertAnswer(
      answers,
      rowsOfAnswerData,
      "AL-2021-1-21E-0612-03"
    );

    const answersWithUpdatedData = jsonpath.query(
      updatedAnswers,
      `$..[?(@.answer_entry == "AL-2021-1-21E-0612-03")]`
    )[0].rows;

    expect(answersWithUpdatedData[1].col6).toEqual(25);
    expect(answersWithUpdatedData[2].col5).toEqual(28);
    expect(answersWithUpdatedData[3].col4).toEqual(24);
  });

  test("insertFPL should update the FPL range in all answers", () => {
    const updatedFPLanswers = insertFPL(answers, "428");
    expect(updatedFPLanswers[0]["rows"][0]["col6"]).toEqual("% of FPL 301-428");
    expect(updatedFPLanswers[1]["rows"][0]["col6"]).toEqual("% of FPL 301-428");
    expect(updatedFPLanswers[2]["rows"][0]["col6"]).toEqual("% of FPL 301-428");
  });

  test("clearSingleQuestion should clear the data of an answer object", () => {
    const clearedRows = clearSingleQuestion(answers[1]["rows"]);
    expect(clearedRows[1]["col2"]).toEqual(null);
    expect(clearedRows[2]["col3"]).toEqual(null);
    expect(clearedRows[3]["col4"]).toEqual(null);
  });
});
