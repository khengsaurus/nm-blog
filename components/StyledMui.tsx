import { Button, Typography } from "@mui/material";
import { PageRoute } from "enums";
import { AppContext } from "hooks";
import { useContext } from "react";

interface IStyledTextProps {
  text: string;
  color?: string;
  padding?: string;
  variant?:
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "subtitle1"
    | "subtitle2"
    | "body1"
    | "body2";
  textAlign?: "left" | "center" | "right";
  placeSelf?: "left" | "center" | "right";
  nowrap?: boolean;
  style?: any;
}

interface IStyledButtonProps {
  label: string | any;
  navigate?: string;
  color?: string;
  padding?: string;
  size?: "small" | "medium" | "large";
  variant?: "text" | "outlined" | "contained";
  autoFocus?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  style?: any;
  sx?: any;
  onClick?: () => void;
}

export const StyledButton = ({
  label,
  navigate,
  color,
  type,
  padding = "10px",
  size = "medium",
  variant = "text",
  autoFocus = false,
  disabled = false,
  style = {},
  sx = {},
  onClick,
}: IStyledButtonProps) => {
  const { routerPush } = useContext(AppContext);

  return (
    <Button
      style={{ color, padding, textTransform: "capitalize", ...style }}
      sx={sx}
      size={size}
      variant={variant}
      autoFocus={autoFocus}
      onClick={() =>
        navigate ? routerPush(navigate) : onClick ? onClick() : null
      }
      type={type}
      disabled={disabled}
      disableRipple
    >
      {label}
    </Button>
  );
};

interface ITextNavButtonProps {
  label: string;
  route?: string;
  style?: any;
  onClick?: () => void;
}

export const TextNavButton = ({
  label,
  route,
  style = {},
  onClick,
}: ITextNavButtonProps) => {
  return (
    <StyledButton
      label={label}
      navigate={route}
      onClick={onClick}
      style={{ ...style }}
    />
  );
};

export const HomeButton = ({
  label = "Home",
  style = {},
}: ITextNavButtonProps) => {
  const { routerPush } = useContext(AppContext);

  return (
    <TextNavButton
      label={label}
      onClick={() => routerPush(PageRoute.HOME)}
      style={style}
    />
  );
};

export const StyledText = ({
  text,
  color,
  variant = "body1",
  padding = variant.startsWith("h") ? "5px 0px" : "0px",
  textAlign = "left",
  placeSelf = "left",
  nowrap = false,
  style = {},
}: IStyledTextProps) => {
  return (
    <Typography
      style={{
        color,
        padding,
        textAlign,
        placeSelf,
        whiteSpace: nowrap ? "nowrap" : null,
        textOverflow: nowrap ? "ellipsis" : null,
        ...style,
      }}
      variant={variant}
    >
      {text}
    </Typography>
  );
};

export const StyledCenterText = ({
  text,
  padding,
  style,
  variant = "body1",
}: IStyledTextProps) => (
  <Typography
    style={{
      ...style,
      justifySelf: "center",
      alignSelf: "center",
      textAlign: "center",
      placeSelf: "center",
      padding: padding ? padding : variant === "h6" ? "5px 0px" : "0px",
    }}
    variant={variant}
  >
    {text}
  </Typography>
);
