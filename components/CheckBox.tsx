import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import IconButton from "@mui/material/IconButton";
import React from "react";
import { StyledText } from "./StyledMui";

interface ICheckboxProps {
  value: boolean;
  setValue: (b?: boolean) => void;
  label?: string;
}

const CheckBox = ({ value, setValue, label }: ICheckboxProps) => {
  return (
    <>
      <IconButton
        onClick={() => setValue(!value)}
        disableRipple
        style={{ padding: 8 }}
      >
        {value ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
      </IconButton>
      {label && <StyledText text={label} variant="body1" />}
    </>
  );
};

export default CheckBox;
