import { IconButton } from "@mui/material";

interface IDropdownItemProps {
  callback?: () => void;
  children?: any;
  leftIcon?: any;
  rightIcon?: any;
}

const DropdownItem = (props: IDropdownItemProps) => {
  const { callback, leftIcon, children, rightIcon } = props;
  return (
    <a href="#" className="menu-item" onClick={callback}>
      {leftIcon && (
        <span className="icon-button">
          <IconButton>{leftIcon}</IconButton>
        </span>
      )}
      {children}
      {rightIcon && (
        <span className="icon-right">
          <IconButton>{rightIcon}</IconButton>
        </span>
      )}
    </a>
  );
};

export default DropdownItem;
