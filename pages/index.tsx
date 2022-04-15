import { useRouter } from "next/router";
import React, { useContext, useEffect } from "react";
import { PageRoute } from "../enum";
import { AppContext } from "../hooks";

const Home: React.FC = () => {
  const router = useRouter();
  const { user } = useContext(AppContext);

  useEffect(() => {
    if (!user) {
      router?.push(PageRoute.LOGIN);
    }
  }, [router, user]);

  return <main>Index</main>;
};

export default Home;
