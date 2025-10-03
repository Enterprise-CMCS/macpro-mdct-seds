import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import SummaryNotes from "./SummaryNotes";
import { render, screen, waitFor } from "@testing-library/react";
import { storeFactory } from "../../provider-mocks/testUtils";
import { getUserInfo } from "../../utility-functions/userFunctions";
import { FinalCertifiedStatusFields, InProgressStatusFields } from "../../utility-functions/formStatus";

jest.mock("../../utility-functions/userFunctions", () => ({
  getUserInfo: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: jest.fn(),
}));

const renderComponent = (
  userRole,
  statusData,
  initialComment = ""
) => {
  getUserInfo.mockResolvedValue({ Items: [{ role: userRole }] });
  const state_comments = initialComment
    ? [{ entry: initialComment }]
    : undefined;

  const store = storeFactory({
    currentForm: {
      statusData: {
        ...statusData,
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
    renderComponent("state", InProgressStatusFields());
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    
    const commentBox = findCommentBox();
    expect(commentBox).toBeInTheDocument();
    expect(commentBox).not.toBeDisabled();
    expect(commentBox.value).toBe("");
  });

  it("should render existing notes", async () => {
    renderComponent("state", FinalCertifiedStatusFields(), "existing comment");
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    
    const commentBox = findCommentBox();
    expect(commentBox.value).toBe("existing comment");
  });

  it("should disable the input for admin users", async () => {
    renderComponent("admin", InProgressStatusFields());
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    
    const commentBox = findCommentBox();
    expect(commentBox).toBeDisabled();
  });

  it("should disable the input for certified forms", async () => {
    renderComponent("state", FinalCertifiedStatusFields());
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    
    const commentBox = findCommentBox();
    expect(commentBox).toBeDisabled();
  });
});
