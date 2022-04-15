import { useRouter } from "next/router";
import React, { useContext, useEffect } from "react";
import HomePage from "../components/HomePage";
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

  const markup = (
    <div>
      <h1>Welcome {user?.username}</h1>
    </div>
  );

  return <HomePage title={"Home Page"} markup={markup} />;
};

export default Home;
