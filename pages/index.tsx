import React, { useContext } from "react";
import { HomePage, StyledButton, StyledCenterText } from "../components";
import PostCard from "../components/PostCard";
import { PageTitle } from "../enums";
import { AppContext } from "../hooks";
import { mongoConnection } from "../lib/server";
import { IPost } from "../types";
import { docToObject } from "../util";

interface IHomeProps {
  posts: IPost[];
}

const LIMIT = 5;

export async function getServerSideProps() {
  const { Post } = await mongoConnection();
  const postQuery = await Post.find()
    .sort({ createdAt: -1 })
    .limit(LIMIT)
    .populate("user", "-createdAt -email -password")
    .lean()
    .exec();
  const posts = postQuery.map((post) => docToObject(post));

  return {
    props: { posts },
  };
}

const Home: React.FC = ({ posts }: IHomeProps) => {
  const { user, logout } = useContext(AppContext);

  const markup = (
    <div>
      <StyledCenterText text={"Welcome" + ` ${user?.username || ""}`} />
      {posts.map((post, index) => (
        <PostCard key={index} post={post} />
      ))}
      {!!user && <StyledButton label={"Logout"} onClick={logout} />}
    </div>
  );

  return <HomePage title={PageTitle.HOME} markup={markup} />;
};

export default Home;
