import { Row, StyledButton } from "components";
import React, { useState } from "react";
import CheckBox from "./CheckBox";

interface IEditPostButtons {
  isPrivate: boolean;
  setIsPrivate: (b: boolean) => void;
  hasMarkdown: boolean;
  setHasMarkdown: (b: boolean) => void;
  saveButtonLabel: any;
  saveDisabled: boolean;
  handleSave: () => Promise<any>;
  isEdit: boolean;
  onCancel?: () => void;
  onDelete?: () => void;
}

const lastButtonStyle = { marginRight: -10 };

const EditPostButtons = ({
  isPrivate,
  setIsPrivate,
  hasMarkdown,
  setHasMarkdown,
  saveButtonLabel,
  saveDisabled,
  handleSave,
  isEdit,
  onCancel = null,
  onDelete = null,
}: IEditPostButtons) => {
  const [cancelCalled, setCancelCalled] = useState(false);

  function renderCancelDelete() {
    return (
      <div>
        <StyledButton
          label={"Cancel"}
          disabled={cancelCalled}
          onClick={() => {
            setCancelCalled(true);
            onCancel();
          }}
          style={lastButtonStyle}
        />
        <StyledButton
          label="Delete"
          onClick={onDelete}
          style={lastButtonStyle}
        />
      </div>
    );
  }

  function renderSaveButton() {
    return (
      <StyledButton
        label={saveButtonLabel}
        disabled={saveDisabled}
        onClick={handleSave}
        style={lastButtonStyle}
      />
    );
  }

  return (
    <>
      <div className={`row ${isEdit ? "last-end" : ""}`}>
        <CheckBox
          value={isPrivate}
          setValue={setIsPrivate}
          label="Private post"
        />
        {isEdit && renderSaveButton()}
      </div>
      <div className="row last-end">
        <CheckBox
          value={hasMarkdown}
          setValue={setHasMarkdown}
          label="Has markdown"
        />
        {isEdit ? renderCancelDelete() : renderSaveButton()}
      </div>
    </>
  );
};

export default EditPostButtons;
