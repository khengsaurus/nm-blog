import { useMemo, ReactNode, useContext, useEffect } from "react";
import { NavBar } from ".";
import { PageRoute, Status } from "../enums";
import { AppContext } from "../hooks";

const authRoutes = [];

interface ILayoutProps {
  children: any;
}

const Layout = ({ children }: ILayoutProps) => {
  const { router, user, sessionValidation } = useContext(AppContext);
  const sessionActive = !!user;

  const requireAuth = useMemo(() => {
    return authRoutes.includes(router?.asPath);
  }, [router?.asPath]);

  useEffect(() => {
    if (
      requireAuth &&
      (sessionValidation === Status.SUCCESS ||
        sessionValidation === Status.ERROR) &&
      !sessionActive
    ) {
      router?.push(PageRoute.LOGIN);
    }
  }, [requireAuth, router, sessionActive, sessionValidation]);

  return (
    <>
      <NavBar />
      {children}
    </>
  );
};

export default Layout;
