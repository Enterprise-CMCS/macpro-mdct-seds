import dynamoDb from "../../libs/dynamodb-lib.js";
import { getTemplate, putTemplate } from "../../storage/formTemplates.js";
import { writeAllFormQuestions } from "../../storage/formQuestions.js";

export async function getStatesList() {
  const stateParams = {
    TableName: process.env.StatesTable,
  };

  let stateResult;

  try {
    stateResult = await dynamoDb.scan(stateParams);
  } catch (e) {
    console.log("getStatesList failed");
    throw e;
  }

  return stateResult.Items;
}

// This function is called when no entries are found in the question table matching the requested year
export async function fetchOrCreateQuestions(parsedYear) {
  let templateResult = await getTemplate(parsedYear);

  let questionsForThisYear;

  if (!templateResult) {
    // no template was found matching this current year
    // trigger a function to generate a template & retrieve questions from template

    const previousYear = parsedYear - 1;

    const previousYearTemplateResult = await getTemplate(previousYear);
    if (!previousYearTemplateResult) {
      return {
        status: 500,
        message: `Failed to generate form template, check requested year`,
      };
    }

    const createdTemplateQuestions = replaceFormYear(
      parsedYear,
      previousYearTemplateResult.template
    );

    try {
      await createFormTemplate(parsedYear, createdTemplateQuestions);
      questionsForThisYear = createdTemplateQuestions;
    } catch (e) {
      console.error(
        `Failed to add template for ${parsedYear} to form-template table`
      );
      return {
        status: 400,
        message: "Please verify that the template contains valid JSON",
      };
    }
  } else {
    questionsForThisYear = templateResult.template;
  }

  // Add the questions that were created or found in an existing template to the questions table
  // these are the questions found in the template table or created along with a new template
  let questionSuccess = await addToQuestionTable(
    questionsForThisYear,
    parsedYear
  );

  // Add the questions created/accessed from a template to the status object returned from this function
  questionSuccess.payload = questionsForThisYear;
  return questionSuccess;
}

function replaceFormYear(year, templateQuestions) {
  const yearToReplace = `${year - 1}`;
  const currentYear = `${year}`;

  // Build searchregex
  const re = new RegExp("" + yearToReplace + "", "g");

  // Replace all instances of the previous year with the new year
  const updatedYear = JSON.parse(
    JSON.stringify(templateQuestions).replace(re, currentYear)
  );
  const updatedCreationDate = updatedYear.map((element) => {
    return {
      ...element,
      created_date: new Date().toISOString(),
      last_modified: new Date().toISOString(),
    };
  });
  return updatedCreationDate;
}

export async function addToQuestionTable(questionsForThisYear, questionYear) {
  // This function is for adding questions to the question table
  // By this point, questions have been found or created for a given year

  // Map through the found questions and create batch put requests for the questions table
  const questionsFromTemplate = questionsForThisYear.map((question) => ({
    ...question,
    year: parseInt(questionYear),
    created_date: new Date().toISOString(),
    last_modified: new Date().toISOString(),
  }));

  await writeAllFormQuestions(questionsFromTemplate);

  return {
    status: 200,
    message: `Questions added to form questions table from template`,
  };
}

export async function createFormTemplate(year, questions) {
  // try to stringify and parse the incoming data to verify if valid json
  let unValidatedJSON = JSON.parse(JSON.stringify(questions));

  let validatedJSON =
    unValidatedJSON && typeof unValidatedJSON === "object"
      ? unValidatedJSON
      : false;

  if (!year || !questions) {
    return {
      status: 422,
      message: `Please specify both a year and a template`,
    };
  }

  if (!unValidatedJSON) {
    return {
      status: 400,
      message: `Invalid JSON. Please review your template.`,
    };
  }

  try {
    await putTemplate({
      year: parseInt(year),
      template: validatedJSON,
      lastSynced: new Date().toISOString(),
    });
    return {
      status: 200,
      message: `Template updated for ${year}!`,
    };
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      message: `Error adding form template to form-template table`,
    };
  }
}
