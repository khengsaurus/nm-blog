import { Button, Typography } from "@mui/material";
import { useRouter } from "next/router";

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
  style?: any;
}

interface IStyledButtonProps {
  label: string;
  navigate?: string;
  color?: string;
  padding?: string;
  size?: "small" | "medium" | "large";
  variant?: "text" | "outlined" | "contained";
  autoFocus?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  style?: any;
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
  onClick,
}: IStyledButtonProps) => {
  const router = useRouter();

  return (
    <Button
      style={{ color, padding, ...style }}
      size={size}
      variant={variant}
      autoFocus={autoFocus}
      onClick={() =>
        navigate ? router.push(navigate) : onClick ? onClick() : null
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
  const router = useRouter();

  return (
    <TextNavButton
      label={label}
      onClick={() => router.push("/")}
      style={style}
    />
  );
};

export const StyledText = ({
  text,
  color,
  variant = "body1",
  padding = variant.startsWith("body") ? "0px" : "5px 0px",
  textAlign = "left",
  placeSelf = "center",
  style = {},
}: IStyledTextProps) => (
  <Typography
    style={{
      justifySelf: "center",
      alignSelf: "center",
      color,
      padding,
      textAlign,
      placeSelf,
      ...style,
    }}
    variant={variant}
  >
    {text}
  </Typography>
);

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
