import { ReactNode, useContext, useEffect } from "react";
import { NavBar } from "../components";
import { PageRoute } from "../enums";
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
  const { router, sessionActive } = useContext(AppContext);

  useEffect(() => {
    Promise.resolve().then(() => {
      if (requireAuth && !sessionActive) {
        router?.push(PageRoute.LOGIN);
      }
    });
  }, [requireAuth, router, sessionActive]);

  return (
    <main className={mainClass}>
      {showNavbar && <NavBar title={title} />}
      {markup}
    </main>
  );
};

export default HomePage;
