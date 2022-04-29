import React, { useContext } from "react";
import HomePage from "../components/HomePage";
import { PageTitle } from "../enums";
import { AppContext } from "../hooks";
import { StyledCenterText } from "../styles/StyledMui";

const Home: React.FC = () => {
  const { user, logout } = useContext(AppContext);

  const markup = (
    <div>
      <StyledCenterText text={"Welcome" + ` ${user?.username || ""}`} />
      {!!user && <button onClick={logout}>Logout</button>}
    </div>
  );

  return <HomePage title={PageTitle.HOME} markup={markup} />;
};

export default Home;
