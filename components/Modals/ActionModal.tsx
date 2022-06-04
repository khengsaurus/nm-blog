import { Dialog, DialogActions, DialogContent } from "@mui/material";
import React from "react";
import { StyledButton, StyledCenterText } from "../StyledMui";

interface IButtonProps {
  text?: string;
  action?: () => void;
  disabled?: boolean;
}

interface IActionModalProps {
  show: boolean;
  text: string;
  buttons: IButtonProps[];
}

const ActionModal = ({ show, text, buttons }: IActionModalProps) => {
  return (
    <Dialog open={show} BackdropProps={{ invisible: true }}>
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
};

export default ActionModal;
