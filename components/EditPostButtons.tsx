import { StyledButton } from "components";
import { PageRoute } from "enums";
import { AppContext } from "hooks";
import React, { useContext, useState } from "react";
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
  deleteClick?: (e: React.MouseEvent) => void;
}

const lastButtonStyle = { marginRight: -10 };

const EditPostButtons = ({
  isPrivate,
  setIsPrivate,
  hasMarkdown,
  setHasMarkdown,
  isEdit,
  saveButtonLabel,
  saveDisabled,
  handleSave,
  deleteClick = null,
}: IEditPostButtons) => {
  const { routerPush } = useContext(AppContext);
  const [cancelCalled, setCancelCalled] = useState(false);

  function renderCancelDelete() {
    return (
      <div>
        <StyledButton
          label={"Cancel"}
          disabled={cancelCalled}
          onClick={() => {
            setCancelCalled(true);
            routerPush(PageRoute.MY_POSTS);
          }}
          style={lastButtonStyle}
        />
        <StyledButton
          label="Delete"
          onClick={deleteClick}
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
