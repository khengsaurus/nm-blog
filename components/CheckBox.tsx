import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { IconButton } from "@mui/material";
import { StyledText } from "./StyledMui";

interface ICheckboxProps {
  value: boolean;
  label?: string;
  toggleValue: () => void;
}

const CheckBox = ({ label, value, toggleValue }: ICheckboxProps) => {
  return (
    <>
      <IconButton onClick={toggleValue} disableRipple style={{ padding: 8 }}>
        {value ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
      </IconButton>
      {label && <StyledText text={label} variant="body1" />}
    </>
  );
};

export default CheckBox;
