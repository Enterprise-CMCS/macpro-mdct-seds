import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStore } from "./store";
import { getForm, updateForm, updateTotals } from "../libs/api";

vi.mock("../libs/api", () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ username: "mockUsername" }),
  getForm: vi.fn(),
  updateForm: vi.fn(),
  updateTotals: vi.fn(),
}));

const mockStatusData = { state_id: "CO", year: 2025, quarter: 4, form: "21E" };
const mockQuestions = [
  { question: "2025-21E-01" },
  { question: "2025-21E-02" },
];
const mockAnswers = [
  { answer_entry: "CO-2025-21E-0105-01", rangeId: "0105" },
  { answer_entry: "CO-2025-21E-0105-02", rangeId: "0105" },
  { answer_entry: "CO-2025-21E-0618-01", rangeId: "0618" },
  { answer_entry: "CO-2025-21E-0618-02", rangeId: "0618" },
];

const anyDate = expect.stringMatching(
  /^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d\d\dZ$/
);

describe("useStore actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loadForm", () => {
    it("should call both API endpoints to populate the store", async () => {
      getForm.mockResolvedValueOnce({
        statusData: mockStatusData,
        questions: mockQuestions,
        answers: mockAnswers,
      });

      const { loadForm } = useStore.getState();
      await loadForm("CO", 2025, 4, "21E");
      const state = useStore.getState();

      expect(state.loadError).toBe(false);
      expect(state.answers).toBe(mockAnswers);
      expect(state.questions).toBe(mockQuestions);
      expect(state.statusData).toBe(mockStatusData);
      expect(state.tabs).toEqual(["0105", "0618"]);
    });

    it("should flag a load error if an API call fails", async () => {
      getForm.mockRejectedValueOnce("Mock Server Error");

      const { loadForm } = useStore.getState();
      await loadForm("CO", 2025, 4, "21E");
      const state = useStore.getState();

      expect(state.loadError).toBe(true);
    });

    it("should sort questions by number", async () => {
      getForm.mockResolvedValueOnce({
        questions: [
          { question: "2025-21E-01" },
          { question: "2025-21E-04" },
          { question: "2025-21E-05" },
          { question: "2025-21E-02" },
          { question: "2025-21E-03" },
        ],
        answers: [],
      });

      const { loadForm } = useStore.getState();
      await loadForm("CO", 2025, 4, "21E");
      const state = useStore.getState();

      expect(state.loadError).toBe(false);
      expect(state.questions).toEqual([
        { question: "2025-21E-01" },
        { question: "2025-21E-02" },
        { question: "2025-21E-03" },
        { question: "2025-21E-04" },
        { question: "2025-21E-05" },
      ]);
    });
  });

  describe("updateAnswer", () => {
    it("should format answer data and store it", () => {
      useStore.setState({
        answers: [
          {
            answer_entry: "CO-2025-21E-0618-01",
            rows: [
              { col1: "", col2: "col header A", col3: "col header B" },
              { col1: "row header A", col2: null, col3: null },
              { col1: "row header B", col2: null, col3: null },
            ],
          },
        ],
      });
      const newAnswers = [
        undefined,
        undefined,
        [undefined, undefined, 12, 34],
        [undefined, undefined, 56, 78],
      ];

      const { updateAnswer } = useStore.getState();
      updateAnswer(newAnswers, "CO-2025-21E-0618-01");
      const state = useStore.getState();

      expect(state.answers[0].rows).toEqual([
        expect.any(Object),
        { col1: "row header A", col2: 12, col3: 34 },
        { col1: "row header B", col2: 56, col3: 78 },
      ]);
    });
  });

  describe("updateFpl", () => {
    it("should modify the 6th column header of every answer", () => {
      useStore.setState({
        answers: [
          { rows: [{ col6: "% of FPL 301" }] },
          { rows: [{ col6: "% of FPL 301-400" }] },
        ],
      });

      const { updateFpl } = useStore.getState();
      updateFpl("435");
      const state = useStore.getState();

      expect(state.answers[0].rows[0].col6).toBe("% of FPL 301-435");
      expect(state.answers[1].rows[0].col6).toBe("% of FPL 301-435");
    });
  });

  describe("wipeForm", () => {
    it("should clear the data from every answer row, except headers and formulas", () => {
      useStore.setState({
        user: { username: "mockUsername" },
        answers: [
          {
            rows: [
              {
                col1: "",
                col2: "header A",
                col3: "header B",
              },
              {
                col1: "row X",
                col2: 12,
                col3: 34,
              },
              {
                col1: "row Y",
                col2: [{ actions: ["formula"] }],
                col3: 78,
              },
            ],
          },
        ],
      });

      const { wipeForm } = useStore.getState();
      wipeForm();
      const state = useStore.getState();

      expect(state.answers).toEqual([
        {
          last_modified: expect.stringMatching(/^[\d\-]+T[\d:\.]+Z$/),
          last_modified_by: "mockUsername",
          rows: [
            {
              col1: "",
              col2: "header A",
              col3: "header B",
            },
            {
              col1: "row X",
              col2: null,
              col3: null,
            },
            {
              col1: "row Y",
              col2: [{ actions: ["formula"] }],
              col3: 78,
            },
          ],
        },
      ]);
    });
  });

  describe("updateFormStatus", () => {
    it("should update status and traceability fields", () => {
      useStore.setState({
        user: { username: "mockUsername" },
        statusData: { state_form: "CO-2025-4-21E" },
      });

      const { updateFormStatus } = useStore.getState();
      // TODO hardcoded status_id. Use FormStatus.NotRequired.
      updateFormStatus(4);
      const state = useStore.getState();

      expect(state.statusData).toEqual({
        state_form: "CO-2025-4-21E",
        status_id: 4,
        status_date: anyDate,
        status_modified_by: "mockUsername",
        last_modified: anyDate,
        last_modified_by: "mockUsername",
      });
    });
  });

  describe("updateSummaryNotes", () => {
    it("should store updated notes within statusData", () => {
      useStore.setState({
        statusData: {
          state_form: "CO-2025-4-21E",
          state_comments: [
            {
              type: "text_multiline",
              entry: "previous comment",
            },
          ],
        },
      });

      const { updateSummaryNotes } = useStore.getState();
      updateSummaryNotes("new comment");
      const state = useStore.getState();

      expect(state.statusData).toEqual({
        state_form: "CO-2025-4-21E",
        state_comments: [
          {
            type: "text_multiline",
            entry: "new comment",
          },
        ],
      });
    });
  });

  describe("saveForm", () => {
    it("should call both API endpoints to save the form", async () => {
      useStore.setState({
        user: { username: "mockUsername" },
        questions: mockQuestions,
        answers: mockAnswers,
        statusData: mockStatusData,
      });

      const { saveForm } = useStore.getState();
      await saveForm();
      const state = useStore.getState();

      expect(state).toEqual(
        expect.objectContaining({
          questions: mockQuestions,
          answers: mockAnswers,
          statusData: {
            ...mockStatusData,
            last_modified: anyDate,
            last_modified_by: "mockUsername",
            save_error: false,
          },
        })
      );
      expect(updateForm).toHaveBeenCalledWith({
        formAnswers: mockAnswers,
        statusData: mockStatusData,
      });
      expect(updateTotals).toHaveBeenCalledWith({
        state: "CO",
        form: "21E",
        year: 2025,
        quarter: 4,
        totalEnrollment: 0,
      });
    });

    it("should compute total enrollment from answer data", async () => {
      useStore.setState({
        statusData: mockStatusData,
        answers: [
          {
            question: "2025-21E-07",
            rangeId: "0105",
            rows: [
              { col1: "", col2: "header A", col3: "header B" },
              { col1: "header X", col2: 12, col3: 23 },
              { col1: "header Y", col2: 45, col3: 56 },
            ],
          },
          {
            question: "2025-21E-07",
            rangeId: "0618",
            rows: [
              { col1: "", col2: "header A", col3: "header B" },
              { col1: "header X", col2: 67, col3: 78 },
              { col1: "header Y", col2: 89, col3: 90 },
            ],
          },
        ],
      });

      const { saveForm } = useStore.getState();
      await saveForm();

      expect(updateTotals).toHaveBeenCalledWith(
        expect.objectContaining({
          totalEnrollment: 460,
        })
      );
    });

    it("should flag a save error if an API call fails", async () => {
      useStore.setState({
        statusData: { save_error: false },
      });
      updateTotals.mockRejectedValueOnce("Mock Server Error");

      const { saveForm } = useStore.getState();
      await saveForm();
      const state = useStore.getState();

      expect(state.statusData.save_error).toBe(true);
    });
  });

  describe("loadUser", () => {
    it("should call the API to populate user data in the store", async () => {
      useStore.setState({ user: {} });

      const { loadUser } = useStore.getState();
      await loadUser();
      const state = useStore.getState();

      expect(state.user.username).toBe("mockUsername");
    });
  });

  describe("wipeUser", () => {
    it("should clear user data from the store", async () => {
      useStore.setState({ user: { username: "mockUsername", role: "admin" } });

      const { wipeUser } = useStore.getState();
      wipeUser();
      const state = useStore.getState();

      expect(state.user).toEqual({});
    });
  });
});
