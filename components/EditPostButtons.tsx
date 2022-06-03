import { Row, StyledButton } from "components";
import React from "react";
import CheckBox from "./CheckBox";

interface IEditPostButtons {
  isPrivate: boolean;
  setIsPrivate: (b: boolean) => void;
  hasMarkdown: boolean;
  setHasMarkdown: (b: boolean) => void;
  saveButtonLabel: any;
  saveDisabled: boolean;
  handleSave: () => Promise<any>;
}

const EditPostButtons = ({
  isPrivate,
  setIsPrivate,
  hasMarkdown,
  setHasMarkdown,
  saveButtonLabel,
  saveDisabled,
  handleSave,
}: IEditPostButtons) => {
  return (
    <>
      <Row style={{ justifyContent: "flex-start" }}>
        <CheckBox
          value={isPrivate}
          setValue={setIsPrivate}
          label="Private post"
        />
      </Row>
      <div className="justify-start-last-end">
        <CheckBox
          value={hasMarkdown}
          setValue={setHasMarkdown}
          label="Has markdown"
        />
        <StyledButton
          label={saveButtonLabel}
          disabled={saveDisabled}
          onClick={handleSave}
          style={{ marginRight: -10 }}
        />
      </div>
    </>
  );
};

export default EditPostButtons;
