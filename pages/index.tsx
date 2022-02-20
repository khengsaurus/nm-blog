import { useRouter } from "next/router";
import React, { useContext, useEffect } from "react";
import { PageRoute } from "../enum";
import { AppContext } from "../lib/context";

const Home: React.FC = () => {
  const router = useRouter();
  const { user } = useContext(AppContext);

  useEffect(() => {
    if (!user) {
      router?.push(PageRoute.LOGIN);
    }
  }, [router, user]);

  return (
    <main>
      <div>Home</div>
    </main>
  );
};

export default Home;
