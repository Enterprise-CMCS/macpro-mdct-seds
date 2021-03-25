import jsonpath from "jsonpath";
import {
  sortQuestionsByNumber,
  extractAgeRanges,
  formatAnswerData,
  insertAnswer
} from "../helperFunctions";
import {
  answers,
  questions,
  tabs,
  statusData
} from "./singleFormTestVariables";
import singleFormReducer, {
  gotFormData,
  UPDATE_ANSWER,
  getFormData
} from "../reducers/singleForm";
import configureStore from "redux-mock-store";

const initialState = {
  questions: [],
  answers: [],
  statusData: {},
  tabs: []
};

describe("Single Form Reducer, default values", () => {
  it("Should return default questions array", () => {
    const store = singleFormReducer(undefined, {});
    expect(store.questions).toEqual([]);
  });

  it("Should return default answers array", () => {
    const store = singleFormReducer(undefined, {});
    expect(store.answers).toEqual([]);
  });

  it("Should return default tabs array", () => {
    const store = singleFormReducer(undefined, {});
    expect(store.tabs).toEqual([]);
  });
  it("Should return default status object", () => {
    const store = singleFormReducer(undefined, {});
    expect(store.statusData).toEqual({});
  });
  it("Should return default state when not given an action type", () => {
    const store = singleFormReducer(undefined, {});
    expect(store).toEqual(initialState);
  });
});

describe("Single Form Reducer, with populated with values", () => {
  let initialState;
  let mockInputTemplate;

  beforeEach(() => {
    initialState = {
      questions: questions,
      answers: answers,
      statusData: statusData,
      tabs: tabs
    };

    mockInputTemplate = [
      {
        col2: null,
        col3: null,
        col4: null,
        col5: null,
        col6: null
      },
      {
        col2: null,
        col3: null,
        col4: null,
        col5: null,
        col6: null
      },
      {
        col2: null,
        col3: null,
        col4: null,
        col5: null,
        col6: null
      }
    ];
  });

  it("Should return an updated state if provided with input", () => {
    const inputQuestionID = "AL-2021-1-21E-0612-03";
    const inputData = {
      col2: 1,
      col3: 1,
      col4: 2,
      col5: 3,
      col6: 5
    };
    // Lets mix up the fake input, specific to this test
    mockInputTemplate[0] = inputData;

    const store = singleFormReducer(initialState, {
      type: UPDATE_ANSWER,
      answerArray: mockInputTemplate,
      questionID: inputQuestionID
    });

    const foundAnswer = jsonpath.query(
      store.answers,
      `$..[?(@.answer_entry == "${inputQuestionID}")]`
    )[0];
    const answerRows = foundAnswer.rows;

    expect(answerRows[1].col5).toEqual(3);
  });

  it("Should return an updated state if provided with input", () => {
    const inputQuestionID = "AL-2021-1-21E-0612-09";
    const inputData = {
      col2: 28,
      col3: 4,
      col4: 93,
      col5: 413,
      col6: 27
    };
    // Lets mix up the fake input, specific to this test
    mockInputTemplate[1] = inputData;

    const store = singleFormReducer(initialState, {
      type: UPDATE_ANSWER,
      answerArray: mockInputTemplate,
      questionID: inputQuestionID
    });

    const foundAnswer = jsonpath.query(
      store.answers,
      `$..[?(@.answer_entry == "${inputQuestionID}")]`
    )[0];
    const answerRows = foundAnswer.rows;
    expect(answerRows[2].col2).toEqual(28);
  });

  it("Should return an updated state if provided with input", () => {
    const inputQuestionID = "AL-2021-1-21E-0105-08";
    const inputData = {
      col2: 10,
      col3: 30,
      col4: 50,
      col5: 70,
      col6: 90
    };
    // Lets mix up the fake input, specific to this test
    mockInputTemplate[2] = inputData;

    const store = singleFormReducer(initialState, {
      type: UPDATE_ANSWER,
      answerArray: mockInputTemplate,
      questionID: inputQuestionID
    });

    const foundAnswer = jsonpath.query(
      store.answers,
      `$..[?(@.answer_entry == "${inputQuestionID}")]`
    )[0];
    const answerRows = foundAnswer.rows;

    expect(answerRows[3].col6).toEqual(90);
  });

  it("Should return default state when not given an action type", () => {
    const store = singleFormReducer(initialState, {});
    expect(store).toEqual(initialState);
  });
});

describe("Single Form Reducer, helper functions", () => {
  it("sortQuestionsByNumber should sort an unordered array of questions", () => {
    const sortedQuestions = questions.sort(sortQuestionsByNumber);
    expect(sortedQuestions[0].question.slice(-2)).toEqual("01");
  });

  it("extractAgeRanges should return all age ranges present in an array of answers", () => {
    const foundAges = extractAgeRanges(answers);
    expect(foundAges).toContain("0612");
    expect(foundAges).toContain("0105");
  });

  it("formatAnswerData should take in an array of numbers and sort them by row and column", () => {
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
  it("insertAnswer should take in rows of answer data and return an answer array with the rows appropriately placed", () => {
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
});

describe("Single Form Reducer, component parts", () => {
  const mockStore = configureStore([]);
  const initialState = {
    questions: questions,
    answers: answers,
    statusData: statusData,
    tabs: tabs
  };

  it("should dispatch an action via action creators", () => {
    const store = mockStore(initialState);
    store.dispatch(gotFormData({}));

    const actions = store.getActions();
    const expectedPayload = {
      type: "LOAD_SINGLE_FORM",
      formObject: {}
    };
    expect(actions).toEqual([expectedPayload]);
  });

  it("thunks should return a function", () => {
    const returnedValue = getFormData("AL", "2021", "1", "21E");
    expect(typeof returnedValue).toEqual("function");
  });
});

// remove prop types check - add when writing tests for a component
// remove unused imports
// move files around
// remove any console logs
// ensure prop types are up to date
