import { useRouter } from "next/router";
import { ReactNode, useContext, useEffect } from "react";
import { NavBar } from "../components";
import { PageRoute } from "../enums";
import { AppContext } from "../hooks";

interface HomePageProps {
  markup: ReactNode;
  title?: string;
  requireAuth?: boolean;
}

const HomePage = ({ markup, title, requireAuth = false }: HomePageProps) => {
  const router = useRouter();
  const { user } = useContext(AppContext);

  useEffect(() => {
    if (requireAuth && !user) {
      router?.push(PageRoute.LOGIN);
    }
  }, [requireAuth, router, user]);

  return (
    <main>
      <NavBar title={title} />
      <div className="centered">{markup}</div>
    </main>
  );
};

export default HomePage;
