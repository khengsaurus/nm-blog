import AddIcon from "@mui/icons-material/Add";
import HomeIcon from "@mui/icons-material/Home";
import { AppBar, IconButton, Toolbar } from "@mui/material";
import { ProfileNav } from "components";
import { PageRoute } from "enums";
import { AppContext } from "hooks";
import { useContext } from "react";

const NavBar: React.FC = () => {
  const { userSessionActive, routerPush } = useContext(AppContext);

  return (
    <AppBar position="fixed">
      <Toolbar variant="dense">
        <IconButton
          aria-label="home"
          onClick={() => routerPush(PageRoute.HOME)}
          disableRipple
        >
          <HomeIcon />
        </IconButton>
        {userSessionActive && (
          <IconButton
            aria-label="new-item"
            onClick={() => routerPush(PageRoute.POST_FORM + "/new")}
            disableRipple
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
