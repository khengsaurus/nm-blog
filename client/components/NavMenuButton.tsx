import { StyledButton } from "components";

interface INavMenuButton {
  label: string;
  fontSize?: number;
  callback?: () => void;
}

const NavMenuButton = ({
  label,
  fontSize = 16,
  callback = null,
}: INavMenuButton) => {
  return (
    <StyledButton
      label={label}
      style={{
        paddingLeft: 10,
        textAlign: "left",
        justifyContent: "left",
        textTransform: "capitalize",
      }}
      sx={{ fontSize: fontSize }}
      onClick={callback}
    />
  );
};

export default NavMenuButton;
