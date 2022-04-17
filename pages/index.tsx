import React, { useContext } from "react";
import HomePage from "../components/HomePage";
import { AppContext } from "../hooks";

const Home: React.FC = () => {
  const { user, logout } = useContext(AppContext);

  const markup = (
    <div>
      <h1>Welcome {user?.username}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );

  return <HomePage title={"Home Page"} markup={markup} requireAuth />;
};

export default Home;
