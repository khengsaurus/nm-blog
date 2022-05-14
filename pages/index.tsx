import React, { useContext } from "react";
import { HomePage, StyledButton, StyledCenterText } from "../components";
import { PageTitle } from "../enums";
import { AppContext } from "../hooks";

const Home: React.FC = () => {
  const { user, logout } = useContext(AppContext);

  const markup = (
    <div>
      <StyledCenterText text={"Welcome" + ` ${user?.username || ""}`} />
      {!!user && <StyledButton label={"Logout"} onClick={logout} />}
    </div>
  );

  return <HomePage title={PageTitle.HOME} markup={markup} />;
};

export default Home;
