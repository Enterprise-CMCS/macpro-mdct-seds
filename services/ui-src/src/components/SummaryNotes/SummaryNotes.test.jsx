import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import SummaryNotes from "./SummaryNotes";
import { render, screen, waitFor } from "@testing-library/react";
import { storeFactory } from "../../provider-mocks/testUtils";
import { getUserInfo } from "../../utility-functions/userFunctions";
import { FormStatus } from "../../utility-functions/types";

jest.mock("../../utility-functions/userFunctions", () => ({
  getUserInfo: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: jest.fn(),
}));

const renderComponent = (
  userRole,
  status_id = FormStatus.NotApplicable,
  initialComment = ""
) => {
  getUserInfo.mockResolvedValue({ Items: [{ role: userRole }] });
  const state_comments = initialComment
    ? [{ entry: initialComment }]
    : undefined;

  const store = storeFactory({
    currentForm: {
      statusData: {
        status_id,
        state_comments,
      },
    },
  });
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <SummaryNotes/>
      </BrowserRouter>
    </Provider>
  )
};

describe("Test SummaryNotes.js", () => {
  const labelText = "Add any notes here to accompany the form submission";
  const findCommentBox = () => screen.getByLabelText(labelText);

  it("should render correctly", async () => {
    renderComponent("state");
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    
    const commentBox = findCommentBox();
    expect(commentBox).toBeInTheDocument();
    expect(commentBox).not.toBeDisabled();
    expect(commentBox.value).toBe("");
  });

  it("should render existing notes", async () => {
    renderComponent("state", 3, "existing comment");
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    
    const commentBox = findCommentBox();
    expect(commentBox.value).toBe("existing comment");
  });

  it("should disable the input for admin users", async () => {
    renderComponent("admin");
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    
    const commentBox = findCommentBox();
    expect(commentBox).toBeDisabled();
  });

  it("should disable the input for certified forms", async () => {
    renderComponent("state", FormStatus.FinalCertified);
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    
    const commentBox = findCommentBox();
    expect(commentBox).toBeDisabled();
  });
});
