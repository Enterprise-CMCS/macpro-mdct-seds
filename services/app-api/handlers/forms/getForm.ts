import handler from "../../libs/handler-lib.ts";
import { canReadDataForState } from "../../auth/authConditions.ts";
import { forbidden, notFound, ok } from "../../libs/response-lib.ts";
import { readFormIdentifiersFromPath } from "../../libs/parsing.ts";
import { getStateForm } from "../../storage/stateForms.ts";
import { queryAnswersByForm } from "../../storage/formAnswers.ts";
import { scanQuestionsByYearAndForm } from "../../storage/formQuestions.ts";

export const main = handler(readFormIdentifiersFromPath, async (request) => {
  const { state, year, quarter, form } = request.parameters;

  if (!canReadDataForState(request.user, state)) {
    return forbidden();
  }

  const state_form = `${state}-${year}-${quarter}-${form}`;
  const statusData = await getStateForm(state_form);

  if (!statusData) {
    return notFound(`Could not find form with ID ${state_form}`);
  }

  const answers = await queryAnswersByForm(state_form);
  const questions = await scanQuestionsByYearAndForm(year, form);

  return ok({ statusData, questions, answers });
});
