import { Row, StyledButton } from "components";
import { PageRoute } from "enums";
import { AppContext } from "hooks";
import React, { useContext, useState } from "react";
import CheckBox from "./CheckBox";

interface IEditPostButtons {
  saveDisabled: boolean;
  saveLabel: string | JSX.Element;
  handleSave: () => Promise<any>;
  handleCancel?: () => void;
}

const lastButtonStyle = { marginRight: -10 };

const EditProfileButtons = ({
  saveDisabled,
  saveLabel,
  handleSave,
}: IEditPostButtons) => {
  const { routerPush } = useContext(AppContext);
  const [saveCalled, setSaveCalled] = useState(false);

  return (
    <Row style={{ justifyContent: "flex-end" }}>
      <StyledButton
        label={"Cancel"}
        onClick={() => routerPush(PageRoute.MY_PROFILE)}
        style={lastButtonStyle}
      />
      <StyledButton
        label={saveLabel}
        disabled={saveDisabled || saveCalled}
        onClick={() => {
          handleSave();
          setSaveCalled(true);
        }}
        style={lastButtonStyle}
      />
    </Row>
  );
};

export default EditProfileButtons;
