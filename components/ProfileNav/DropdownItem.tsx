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
    <a href="#" className="menu-item" onClick={callback}>
      {hasBack ? (
        <span className="icon-button back">
          <IconButton>{<ChevronLeftIcon />}</IconButton>
        </span>
      ) : leftIcon ? (
        <span className="icon-button">
          <IconButton>{leftIcon}</IconButton>
        </span>
      ) : null}
      {children}
      {rightIcon && (
        <span className="icon-button right">
          <IconButton>{rightIcon}</IconButton>
        </span>
      )}
    </a>
  );
};

export default DropdownItem;
