import { useMemo, ReactNode, useContext, useEffect } from "react";
import { NavBar } from ".";
import { PageRoute } from "../enums";
import { AppContext } from "../hooks";

const authRoutes: string[] = [
  PageRoute.MY_POSTS,
  PageRoute.MY_PROFILE,
  PageRoute.NEWPOST,
];

interface ILayoutProps {
  children: any;
}

const Layout = ({ children }: ILayoutProps) => {
  const { router, userSessionActive, routerPush } = useContext(AppContext);

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
      {children}
    </>
  );
};

export default Layout;
