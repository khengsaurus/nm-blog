import AddIcon from "@mui/icons-material/Add";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
import HomeIcon from "@mui/icons-material/Home";
import { AppBar, Toolbar } from "@mui/material";
import { NavButton, ProfileNav } from "components";
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
        <NavButton label="home" icon={<HomeIcon />} path={PageRoute.HOME} />
        {userSessionActive && !isPreLogin && (
          <>
            <NavButton
              label="my-posts"
              icon={<DynamicFeedIcon />}
              path={PageRoute.MY_POSTS}
            />
            <NavButton
              label="new-item"
              icon={<AddIcon />}
              path={PageRoute.POST_FORM + "/new"}
            />
          </>
        )}
        <ProfileNav />
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
