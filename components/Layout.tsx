import { Box } from "@mui/material";
import { PageRoute } from "enums";
import { AppContext } from "hooks";
import { useContext, useEffect } from "react";
import { NavBar } from ".";
import themes from "lib/client/themes";

const authRoutes: string[] = [
  PageRoute.MY_POSTS,
  PageRoute.MY_PROFILE,
  PageRoute.POST_FORM,
];

interface ILayoutProps {
  children: any;
}

const Layout = ({ children }: ILayoutProps) => {
  const { router, userSessionActive, routerPush, theme } =
    useContext(AppContext);
  // const _backgroundColor =
  //   themes[user?.theme || "blue"].mainBackground || "rgb(45, 60, 90)";
  const _backgroundColor = themes[theme].mainBackground || "rgb(40, 40, 40)";

  useEffect(() => {
    if (
      !userSessionActive &&
      !!authRoutes.find((route) => router?.asPath.startsWith(route))
    ) {
      routerPush(PageRoute.LOGIN);
    }
  }, [router?.asPath, userSessionActive, routerPush]);

  return (
    <>
      <NavBar />
      <Box className="background" style={{ backgroundColor: _backgroundColor }}>
        {children}
      </Box>
    </>
  );
};

export default Layout;
