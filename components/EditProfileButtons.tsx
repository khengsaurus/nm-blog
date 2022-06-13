import { StyledButton } from "components";
import { PageRoute } from "enums";
import { AppContext } from "hooks";
import React, { useContext, useState } from "react";
import CheckBox from "./CheckBox";

interface IEditPostButtons {
  bioHasMD: boolean;
  saveDisabled: boolean;
  setBioHasMD: (b: boolean) => void;
  handleSave: () => Promise<any>;
  handleCancel?: () => void;
}

const lastButtonStyle = { marginRight: -10 };

const EditProfileButtons = ({
  bioHasMD,
  saveDisabled,
  setBioHasMD,
  handleSave,
}: IEditPostButtons) => {
  const { routerPush } = useContext(AppContext);
  const [saveCalled, setSaveCalled] = useState(false);

  return (
    <>
      <div className="row last-end">
        <CheckBox
          value={bioHasMD}
          setValue={setBioHasMD}
          label="Bio has markdown"
        />
        <div>
          <StyledButton
            label={"Cancel"}
            onClick={() => routerPush(PageRoute.MY_PROFILE)}
            style={lastButtonStyle}
          />
          <StyledButton
            label={"Save"}
            disabled={saveDisabled || saveCalled}
            onClick={() => {
              handleSave();
              setSaveCalled(true);
            }}
            style={lastButtonStyle}
          />
        </div>
      </div>
    </>
  );
};

export default EditProfileButtons;
