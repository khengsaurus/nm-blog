import React, { useContext } from "react";
import HomePage from "../components/HomePage";
import { DBService, HttpRequest } from "../enum";
import { AppContext } from "../hooks";
import { HTTPService } from "../lib/client";

const Home: React.FC = () => {
  const { user, logout } = useContext(AppContext);

  function get() {
    try {
      HTTPService.makeAuthHttpReq(DBService.USERS, HttpRequest.GET, {
        username: user.username,
      });
    } catch (err) {
      console.log(err);
    }
  }

  const markup = (
    <div>
      <h1>Welcome {user?.username}</h1>
      <button onClick={get}>Get user</button>
      <button onClick={logout}>Logout</button>
    </div>
  );

  return <HomePage title={"Home Page"} markup={markup} requireAuth />;
};

export default Home;
