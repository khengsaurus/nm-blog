import { ReactNode, useContext, useEffect } from "react";
import { NavBar } from "../components";
import { PageRoute } from "../enums";
import { AppContext } from "../hooks";

interface HomePageProps {
  markup: ReactNode;
  title?: string;
  showNavbar?: boolean;
  requireAuth?: boolean;
}

const HomePage = ({
  markup,
  title,
  showNavbar = true,
  requireAuth = false,
}: HomePageProps) => {
  const { router, user } = useContext(AppContext);

  useEffect(() => {
    if (requireAuth && !user) {
      router?.push(PageRoute.LOGIN);
    }
  }, [requireAuth, router, user]);

  return (
    <main>
      {showNavbar && <NavBar title={title} />}
      <div className="centered">{markup}</div>
    </main>
  );
};

export default HomePage;
