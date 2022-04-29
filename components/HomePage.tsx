import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import { PageRoute } from "../enums";
import { AppContext } from "../hooks";
import { StyledCenterText } from "../styles/StyledMui";

interface HomePageProps {
  markup: React.FC | JSX.Element;
  title: string;
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
    <div className="home-page">
      <StyledCenterText text={title} variant="h6" padding="0px 10px 10px" />
      <div className="centered">{markup}</div>
    </div>
  );
};

export default HomePage;
