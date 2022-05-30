import { useMemo, ReactNode, useContext, useEffect } from "react";
import { NavBar } from ".";
import { PageRoute } from "../enums";
import { AppContext } from "../hooks";

const authRoutes: string[] = [PageRoute.MY_PROFILE];

interface ILayoutProps {
  children: any;
}

const Layout = ({ children }: ILayoutProps) => {
  const { router, userSessionActive } = useContext(AppContext);

  useEffect(() => {
    if (authRoutes.includes(router?.asPath) && !userSessionActive) {
      router?.push(PageRoute.LOGIN);
    }
  }, [router, userSessionActive]);

  return (
    <>
      <NavBar />
      {children}
    </>
  );
};

export default Layout;
