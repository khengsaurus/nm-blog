import { Box } from "@mui/material";
import { PageRoute } from "enums";
import { AppContext } from "hooks";
import { themes } from "lib/client";
import { useContext, useEffect, useState } from "react";
import { NavBar } from ".";

const authRoutes: string[] = [
  PageRoute.MY_POSTS,
  PageRoute.MY_PROFILE,
  PageRoute.EDIT_PROFILE,
  PageRoute.POST_FORM,
];

interface ILayoutProps {
  children: any;
}

const Layout = ({ children }: ILayoutProps) => {
  const { router, userSessionActive, theme, routerPush } =
    useContext(AppContext);
  const [bgColor, setBgColor] = useState(themes["embers"]?.background);

  useEffect(() => {
    setBgColor(themes[theme || "embers"]?.background);
  }, [theme]);

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
      <Box className="background" style={{ backgroundColor: bgColor }}>
        {children}
      </Box>
    </>
  );
};

export default Layout;
