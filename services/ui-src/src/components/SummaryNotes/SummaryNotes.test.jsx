import React from "react";
import { describe, expect, it, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import SummaryNotes from "./SummaryNotes";
import { render, screen, waitFor } from "@testing-library/react";
import { getUserInfo } from "../../utility-functions/userFunctions";
import { FinalCertifiedStatusFields, InProgressStatusFields } from "../../utility-functions/formStatus";
import { useStore } from "../../store/store";

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useHistory: vi.fn(),
}));

const renderComponent = (
  userRole,
  statusData,
  initialComment = ""
) => {
  const state_comments = initialComment
    ? [{ entry: initialComment }]
    : undefined;

  useStore.setState({
    user: { role: userRole },
    statusData: {
      ...statusData,
      state_comments,
    },
    updateSummaryNotes: vi.fn(),
  });

  return render(
    <BrowserRouter>
      <SummaryNotes/>
    </BrowserRouter>
  )
};

describe("Test SummaryNotes.js", () => {
  const labelText = "Add any notes here to accompany the form submission";
  const findCommentBox = () => screen.getByLabelText(labelText);

  it("should render correctly", async () => {
    renderComponent("state", InProgressStatusFields());
    
    const commentBox = findCommentBox();
    expect(commentBox).toBeInTheDocument();
    expect(commentBox).not.toBeDisabled();
    expect(commentBox.value).toBe("");
  });

  it("should render existing notes", async () => {
    renderComponent("state", FinalCertifiedStatusFields(), "existing comment");
    
    const commentBox = findCommentBox();
    expect(commentBox.value).toBe("existing comment");
  });

  it("should disable the input for admin users", async () => {
    renderComponent("admin", InProgressStatusFields());
    
    const commentBox = findCommentBox();
    expect(commentBox).toBeDisabled();
  });

  it("should disable the input for certified forms", async () => {
    renderComponent("state", FinalCertifiedStatusFields());
    
    const commentBox = findCommentBox();
    expect(commentBox).toBeDisabled();
  });
});
