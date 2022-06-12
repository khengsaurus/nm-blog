import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { IconButton } from "@mui/material";

interface IDropdownItemProps {
  callback?: () => void;
  hasBack?: boolean;
  children?: any;
  leftIcon?: any;
  rightIcon?: any;
}

const DropdownItem = (props: IDropdownItemProps) => {
  const { callback, hasBack, leftIcon, children, rightIcon } = props;
  return (
    <a href="#" onClick={callback}>
      {hasBack ? (
        <IconButton>{<ChevronLeftIcon />}</IconButton>
      ) : leftIcon ? (
        typeof leftIcon === "string" ? (
          <p className='icon'>{leftIcon}</p>
        ) : (
          <IconButton>{leftIcon}</IconButton>
        )
      ) : null}
      {children}
      {rightIcon && <IconButton className="right">{rightIcon}</IconButton>}
    </a>
  );
};

export default DropdownItem;
