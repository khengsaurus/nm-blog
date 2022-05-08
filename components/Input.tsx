import { InputBaseComponentProps, TextField } from "@mui/material";
import React, { ChangeEventHandler, CSSProperties } from "react";

interface IInput {
  label: string;
  value: string | number;
  variant?: "standard";
  password?: boolean;
  style?: CSSProperties;
  inputProps?: InputBaseComponentProps;
  onChange: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
}

const Input = (props: IInput) => {
  const { password = false, variant = "standard", style = {}, ...rest } = props;
  return (
    <TextField
      {...rest}
      type={password ? "password" : "text"}
      variant={variant}
      style={{ margin: "5px 0", width: "160px", ...style }}
    />
  );
};

export default Input;
