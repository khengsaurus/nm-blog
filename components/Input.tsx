import {
  InputBaseComponentProps,
  InputLabelProps,
  TextField,
} from "@mui/material";
import { ChangeEventHandler, CSSProperties } from "react";

interface IInput {
  label: string;
  value: string | number;
  marginTop?: number;
  maxWidth?: boolean;
  width?: string | number;
  rows?: number;
  maxRows?: number;
  variant?: "standard" | "outlined";
  password?: boolean;
  readonly?: boolean;
  style?: CSSProperties;
  inputProps?: InputBaseComponentProps;
  inputLabelProps?: InputLabelProps;
  onChange: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  onClick?: (e: React.MouseEvent) => void;
}

const Input = (props: IInput) => {
  const {
    marginTop = 0,
    password = false,
    maxWidth = false,
    readonly = false,
    variant = "standard",
    width = "160px",
    style = {},
    inputProps = {},
    inputLabelProps = {},
    ...rest
  } = props;

  return (
    <TextField
      {...rest}
      multiline={props?.rows > 1}
      type={password ? "password" : "text"}
      disabled={readonly}
      variant={variant}
      inputProps={inputProps}
      InputLabelProps={inputLabelProps}
      style={{
        margin: `${marginTop || 5}px 0`,
        width: maxWidth ? "100%" : width,
        ...style,
      }}
    />
  );
};

export default Input;
