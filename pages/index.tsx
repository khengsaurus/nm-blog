import axios from "axios";
import React, { useContext } from "react";
import { HomePage, StyledButton, StyledCenterText } from "../components";
import { DBService, HttpRequest, PageTitle } from "../enums";
import { AppContext } from "../hooks";
import { HTTPService } from "../lib/client";
import { mongoConnection } from "../lib/server";
import { IPost } from "../types";

interface IHomeProps {
  posts: IPost[];
}

const LIMIT = 5;

export async function getServerSideProps() {
  // const postsQuery = await HTTPService.makeGetReq(DBService.POSTS);
  const { Post } = await mongoConnection();
  const posts = await Post.find().sort({ createdAt: -1 }).limit(LIMIT);

  return {
    props: { posts },
  };
}

const Home: React.FC = (props: IHomeProps) => {
  console.log(props);
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
