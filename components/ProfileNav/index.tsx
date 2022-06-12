import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { IconButton } from "@mui/material";
import { useDocumentListener } from "hooks";
import { useCallback, useRef, useState } from "react";
import DropdownMenu from "./DropdownMenu";

const ProfileNav = () => {
  const [open, setOpen] = useState(false);
  const iconRef = useRef<any>(null);
  const menuRef = useRef<any>(null);

  const handleClose = useCallback(() => setOpen(false), [setOpen]);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (
        !iconRef.current.contains(e.target) &&
        !menuRef.current.contains(e.target)
      ) {
        handleClose();
      }
    },
    [handleClose]
  );

  useDocumentListener("mousedown", handleClick, open);

  return (
    <div className="profile-nav">
      <li className="nav-item">
        <IconButton onClick={() => setOpen(!open)} ref={iconRef}>
          <PersonOutlineIcon />
        </IconButton>
      </li>
      <DropdownMenu open={open} handleClose={handleClose} ref={menuRef} />
    </div>
  );
};

export default ProfileNav;
