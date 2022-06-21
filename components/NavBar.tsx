import AddIcon from "@mui/icons-material/Add";
import HomeIcon from "@mui/icons-material/Home";
import { AppBar, IconButton, Toolbar } from "@mui/material";
import { ProfileNav } from "components";
import { PageRoute } from "enums";
import { AppContext } from "hooks";
import { useContext } from "react";

const preLoginRoutes = [PageRoute.LOGIN, PageRoute.NEW_USER];

const NavBar = () => {
  const { userSessionActive, router, routerPush } = useContext(AppContext);
  // edge case - at new-user screen, no username set yet
  const isPreLogin = preLoginRoutes.some((route) =>
    router?.asPath.startsWith(route)
  );

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
        {userSessionActive && !isPreLogin && (
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
