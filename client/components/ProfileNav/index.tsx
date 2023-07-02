import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { Avatar, IconButton } from "@mui/material";
import { AppContext, useDocumentListener } from "hooks";
import { avatarStyles } from "lib/client";
import { useCallback, useContext, useRef, useState } from "react";
import { getAvatarSmall } from "utils";
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
              src={getAvatarSmall(user.avatarKey)}
              sx={avatarStyles.small}
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
