import { Toaster } from "react-hot-toast";
import { Box } from "@mui/material";
import { PageRoute } from "enums";
import { AppContext } from "hooks";
import { themes } from "lib/client";
import { useContext, useEffect, useState } from "react";
import { NavBar } from ".";
import { ITheme } from "types";
import { DEFAULT_THEME } from "consts";

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
  const {
    router,
    userSessionActive,
    theme: _theme,
    routerPush,
  } = useContext(AppContext);
  const [theme, setTheme] = useState<ITheme>(themes[DEFAULT_THEME]);

  useEffect(() => setTheme(themes[_theme || DEFAULT_THEME]), [_theme]);

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
      <Box
        className="background"
        style={{ backgroundColor: theme?.background }}
      >
        {children}
      </Box>
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 5000,
          style: {
            background: theme?.secondary,
            color: theme?.mainText,
            borderRadius: "4px",
          },
        }}
      />
    </>
  );
};

export default Layout;
