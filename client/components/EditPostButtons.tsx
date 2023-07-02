import Tooltip from "@mui/material/Tooltip";
import { Row, StyledButton } from "components";
import { PageRoute } from "enums";
import { AppContext } from "hooks";
import React, { useContext } from "react";
import CheckBox from "./CheckBox";

interface IEditPostButtons {
  isPrivate: boolean;
  markdown: boolean;
  saveButtonLabel: any;
  saveDisabled: boolean;
  isEdit: boolean;
  privateOnly?: boolean;
  togglePrivate: () => void;
  toggleMarkdown: () => void;
  handleSave: () => Promise<any>;
  handleCancel: () => Promise<any>;
  handleDelete?: (e: React.MouseEvent) => void;
}

const EditPostButtons = ({
  isPrivate,
  markdown,
  isEdit,
  saveButtonLabel,
  saveDisabled,
  privateOnly = true,
  togglePrivate,
  toggleMarkdown,
  handleSave,
  handleCancel,
  handleDelete = null,
}: IEditPostButtons) => {
  const { routerPush } = useContext(AppContext);

  function renderCancelDelete() {
    return (
      <>
        <StyledButton
          label="Cancel"
          onClick={() => {
            handleCancel();
            routerPush(PageRoute.MY_POSTS);
          }}
        />
        <StyledButton label="Delete" onClick={handleDelete} />
      </>
    );
  }

  function renderSaveButton() {
    return (
      <StyledButton
        label={saveButtonLabel}
        disabled={saveDisabled}
        onClick={handleSave}
      />
    );
  }

  return (
    <>
      <Tooltip
        title={privateOnly ? "Only admin users can create public posts" : ""}
        followCursor={privateOnly}
      >
        <div className="row">
          <CheckBox
            value={privateOnly || isPrivate}
            toggleValue={togglePrivate}
            label="Private"
            disabled={privateOnly}
          />
        </div>
      </Tooltip>
      <div className="row">
        <CheckBox
          value={markdown}
          toggleValue={toggleMarkdown}
          label="Markdown"
        />
      </div>
      <Row
        style={{
          flexDirection: "row-reverse",
          justifyContent: "space-between",
        }}
      >
        {isEdit && renderSaveButton()}
        {isEdit ? renderCancelDelete() : renderSaveButton()}
      </Row>
    </>
  );
};

export default EditPostButtons;
