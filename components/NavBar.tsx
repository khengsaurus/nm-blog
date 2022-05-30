import AddIcon from "@mui/icons-material/Add";
import HomeIcon from "@mui/icons-material/Home";
import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import { ProfileNav } from "components";
import React, { useContext } from "react";
import { PageRoute } from "../enums";
import { AppContext } from "../hooks";

const NavBar: React.FC = () => {
  const { userSessionActive, routerPush } = useContext(AppContext);

  return (
    <AppBar position="fixed">
      <Toolbar variant="dense">
        <IconButton
          edge="start"
          aria-label="home"
          onClick={() => routerPush(PageRoute.HOME)}
        >
          <HomeIcon />
        </IconButton>
        {userSessionActive && (
          <IconButton
            aria-label="new-item"
            onClick={() => routerPush(PageRoute.NEWPOST)}
          >
            <AddIcon />
          </IconButton>
        )}
        <ProfileNav />
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
