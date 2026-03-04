import { create } from "zustand";
import {
  clearSingleQuestion,
  computeTotalEnrollment,
  extractAgeRanges,
  formatAnswerData,
  insertAnswer,
  insertFPL,
  sortQuestionsByNumber,
} from "./helperFunctions";
import { getCurrentUser, getForm, updateForm, updateTotals } from "../libs/api";

export const useStore = create((set, get) => ({
  // Initial state
  questions: [],
  answers: [],
  statusData: {},
  tabs: [],
  loadError: false,
  user: {},

  // Actions
  loadForm: async (state, year, quarter, formName) => {
    try {
      const form = await getForm(state, year, quarter, formName);
      const { statusData, questions, answers } = form;
      questions.sort(sortQuestionsByNumber);
      const tabs = extractAgeRanges(answers);
      set({ questions, answers, statusData, tabs, loadError: false });
    } catch (err) {
      console.error(err);
      set({ loadError: true });
    }
  },
  updateAnswer: (gridAnswerData, questionId) => {
    set((state) => {
      const answers = insertAnswer(
        state.answers,
        formatAnswerData(gridAnswerData),
        questionId
      );
      return { answers };
    });
  },
  updateFpl: (newFpl) => {
    set((state) => {
      const answers = insertFPL(structuredClone(state.answers), newFpl);
      return { answers };
    });
  },
  wipeForm: () => {
    set((state) => {
      const timeStamp = new Date().toISOString();
      const answers = structuredClone(state.answers).map((answer) => ({
        ...answer,
        rows: clearSingleQuestion(answer.rows),
        last_modified: timeStamp,
        last_modified_by: state.user.username,
      }));
      return { answers };
    });
  },
  updateFormStatus: (status_id) => {
    set((state) => ({
      statusData: {
        ...state.statusData,
        status_id,
        status_date: new Date().toISOString(),
        status_modified_by: state.user.username,
        last_modified: new Date().toISOString(),
        last_modified_by: state.user.username,
      },
    }));
  },
  updateSummaryNotes: (notes) => {
    set((state) => ({
      statusData: {
        ...state.statusData,
        state_comments: [
          {
            type: "text_multiline",
            entry: notes,
          },
        ],
      },
    }));
  },
  saveForm: async () => {
    try {
      const { answers, statusData, user } = get();

      await updateForm({
        formAnswers: answers,
        statusData: statusData,
      });

      await updateTotals({
        state: statusData.state_id,
        year: statusData.year,
        quarter: statusData.quarter,
        form: statusData.form,
        totalEnrollment: computeTotalEnrollment(statusData, answers),
      });

      set({
        statusData: {
          ...statusData,
          last_modified: new Date().toISOString(),
          last_modified_by: user.username,
          save_error: false,
        },
      });
    } catch {
      set((state) => ({
        statusData: {
          ...state.statusData,
          save_error: true,
        },
      }));
    }
  },
  loadUser: async () => {
    const user = (await getCurrentUser()) ?? {};
    set({ user });
  },
  wipeUser: () => set({ user: {} }),
}));
