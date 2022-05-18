import { ReactNode, useContext, useEffect } from "react";
import { NavBar } from "../components";
import { PageRoute, Status } from "../enums";
import { AppContext } from "../hooks";

interface HomePageProps {
  markup: ReactNode;
  title?: string;
  mainClass?: string;
  showNavbar?: boolean;
  requireAuth?: boolean;
}

const HomePage = ({
  markup,
  title,
  mainClass = "",
  showNavbar = true,
  requireAuth = false,
}: HomePageProps) => {
  const { router, user, sessionValidation } = useContext(AppContext);
  const sessionActive = !!user;

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
    <main className={mainClass}>
      {showNavbar && <NavBar title={title} />}
      {markup}
    </main>
  );
};

export default HomePage;
