import { StyledButton } from "components";

interface INavMenuButton {
  label: string;
  fontSize?: number;
}

const NavMenuButton = ({ label, fontSize = 16 }: INavMenuButton) => {
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
    />
  );
};

export default NavMenuButton;
