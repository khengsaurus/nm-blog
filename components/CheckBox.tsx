import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { IconButton } from "@mui/material";
import { StyledText } from "./StyledMui";

interface ICheckboxProps {
  value: boolean;
  label?: string;
  setValue: (b?: boolean) => void;
}

const CheckBox = ({ label, value, setValue }: ICheckboxProps) => {
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
