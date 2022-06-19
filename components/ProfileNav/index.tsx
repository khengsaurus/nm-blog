import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { Avatar, IconButton } from "@mui/material";
import { AppContext, useDocumentListener } from "hooks";
import { useCallback, useContext, useRef, useState } from "react";
import DropdownMenu from "./DropdownMenu";

const ProfileNav = () => {
  const { user } = useContext(AppContext);
  const [open, setOpen] = useState(false);
  const iconRef = useRef<any>(null);
  const menuRef = useRef<any>(null);

  const handleClose = useCallback(() => setOpen(false), [setOpen]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
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
        <IconButton onClick={() => setOpen(!open)} ref={iconRef} disableRipple>
          {user?.avatarKey ? (
            <Avatar
              alt={`profile-icon`}
              src={`${process.env.ENV_IK_SRC}${user.avatarKey}?tr=w-24,h-24`}
              sx={{ width: 24, height: 24 }}
            />
          ) : (
            <PersonOutlineIcon />
          )}
        </IconButton>
      </li>
      <DropdownMenu open={open} handleClose={handleClose} ref={menuRef} />
    </div>
  );
};

export default ProfileNav;
