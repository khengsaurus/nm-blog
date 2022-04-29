import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import { PageRoute } from "../enums";
import { AppContext } from "../hooks";
import NavBar from "./NavBar";

interface HomePageProps {
  markup: React.FC | JSX.Element;
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
