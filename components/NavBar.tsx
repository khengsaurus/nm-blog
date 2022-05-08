import MenuIcon from "@mui/icons-material/Menu";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import React, { useCallback, useContext } from "react";
import { PageRoute } from "../enums";
import { AppContext } from "../hooks";

interface INavBar {
  title: string;
}

const NavBar: React.FC<INavBar> = ({ title }) => {
  const { router, user } = useContext(AppContext);

  const handleProfileClick = useCallback(() => {
    user ? null : router.push(PageRoute.LOGIN);
  }, [router, user]);

  return (
    <AppBar position="fixed">
      <Toolbar variant="dense">
        <IconButton edge="start" aria-label="menu">
          <MenuIcon />
        </IconButton>
        <Typography variant="h6">{title}</Typography>
        <IconButton
          aria-label="profile"
          edge="end"
          onClick={handleProfileClick}
        >
          <PersonOutlineIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
