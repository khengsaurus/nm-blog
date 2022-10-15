import { Row, StyledButton } from "components";
import { PageRoute } from "enums";
import { AppContext } from "hooks";
import React, { useContext, useState } from "react";
import CheckBox from "./CheckBox";

interface IEditPostButtons {
  isPrivate: boolean;
  markdown: boolean;
  saveButtonLabel: any;
  saveDisabled: boolean;
  isEdit: boolean;
  togglePrivate: () => void;
  toggleMarkdown: () => void;
  handleSave: () => Promise<any>;
  deleteClick?: (e: React.MouseEvent) => void;
}

const EditPostButtons = ({
  isPrivate,
  markdown,
  isEdit,
  saveButtonLabel,
  saveDisabled,
  togglePrivate,
  toggleMarkdown,
  handleSave,
  deleteClick = null,
}: IEditPostButtons) => {
  const { routerPush } = useContext(AppContext);
  const [cancelCalled, setCancelCalled] = useState(false);

  function renderCancelDelete() {
    return (
      <>
        <StyledButton
          label={"Cancel"}
          disabled={cancelCalled}
          onClick={() => {
            setCancelCalled(true);
            routerPush(PageRoute.MY_POSTS);
          }}
        />
        <StyledButton label="Delete" onClick={deleteClick} />
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
      <div className={"row"}>
        <CheckBox
          value={isPrivate}
          toggleValue={togglePrivate}
          label="Private"
        />
      </div>
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
