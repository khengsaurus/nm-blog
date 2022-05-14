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

interface INavBar {
  title: string;
}

const NavBar: React.FC<INavBar> = ({ title }) => {
  const { router, sessionActive } = useContext(AppContext);

  const handleProfileClick = useCallback(() => {
    sessionActive ? null : router.push(PageRoute.LOGIN);
  }, [router, sessionActive]);

  return (
    <AppBar position="fixed">
      <Toolbar variant="dense">
        <Typography variant="h6">{title}</Typography>
        <IconButton
          edge="end"
          aria-label="home"
          onClick={() => router.push(PageRoute.HOME)}
        >
          <HomeIcon />
        </IconButton>
        {sessionActive && (
          <IconButton
            edge="end"
            aria-label="new-item"
            onClick={() => router.push(PageRoute.NEWITEM)}
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
