import { Dialog, DialogActions, DialogContent } from "@mui/material";
import React, { forwardRef, MutableRefObject } from "react";
import { StyledButton, StyledCenterText } from "../StyledMui";

interface IButtonProps {
  text?: string;
  disabled?: boolean;
  action?: () => void;
}

interface IActionModalProps {
  show: boolean;
  text: string;
  buttons: IButtonProps[];
  id?: string;
}

const ActionModal = forwardRef<MutableRefObject<any>, IActionModalProps>(
  (props: IActionModalProps, ref: MutableRefObject<any>) => {
    const { show, text, buttons, id } = props;
    return (
      <Dialog open={show} BackdropProps={{ invisible: true }} ref={ref} id={id}>
        <DialogContent>
          <StyledCenterText text={text} variant="subtitle1" />
        </DialogContent>
        <DialogActions style={{ padding: 0 }}>
          {buttons.map((button, ix) => (
            <StyledButton
              key={ix}
              label={button.text}
              onClick={button.action}
              disabled={button.disabled || false}
            />
          ))}
        </DialogActions>
      </Dialog>
    );
  }
);

ActionModal.displayName = "ActionModal";

export default ActionModal;
