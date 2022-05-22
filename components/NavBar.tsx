import AddIcon from "@mui/icons-material/Add";
import HomeIcon from "@mui/icons-material/Home";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import React, { useCallback, useContext } from "react";
import { PageRoute } from "../enums";
import { AppContext } from "../hooks";
// import StorefrontIcon from "@mui/icons-material/Storefront";
// import MenuIcon from "@mui/icons-material/Menu";

const NavBar: React.FC = () => {
  const { router, user } = useContext(AppContext);
  const sessionActive = !!user;

  const handleProfileClick = useCallback(() => {
    sessionActive ? null : router.push(PageRoute.LOGIN);
  }, [sessionActive, router]);

  return (
    <AppBar position="fixed">
      <Toolbar variant="dense">
        <IconButton
          edge="start"
          aria-label="home"
          onClick={() => router.push(PageRoute.HOME)}
        >
          <HomeIcon />
        </IconButton>
        {sessionActive && (
          <IconButton
            aria-label="new-item"
            onClick={() => router.push(PageRoute.NEWPOST)}
          >
            <AddIcon />
          </IconButton>
        )}
        <IconButton
          edge="end"
          aria-label="profile"
          onClick={handleProfileClick}
        >
          <PersonOutlineIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
