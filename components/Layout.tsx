import { Box } from "@mui/material";
import { PageRoute } from "enums";
import { AppContext } from "hooks";
import { useContext, useEffect } from "react";
import { Toaster } from "react-hot-toast";
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

  useEffect(() => {
    if (
      !userSessionActive &&
      authRoutes.some((route) => router?.asPath.startsWith(route))
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
