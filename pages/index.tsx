import React, { useContext } from "react";
import { RowWrap, StyledButton } from "../components";
import PostCard from "../components/PostCard";
import { AppContext } from "../hooks";
import { mongoConnection } from "../lib/server";
import { IPost } from "../types";
import { postDocToObj } from "../utils";

interface IHomeProps {
  posts: IPost[];
  cursor: string;
}

const LIMIT = 6;

export async function getServerSideProps({ res }) {
  console.info("-> Home getServerSideProps()");
  res.setHeader(
    "Cache-Control",
    "public, max-age=300, s-maxage=600, stale-while-revalidate=30"
  );

  const { Post } = await mongoConnection();
  const postQuery = await Post.find()
    .sort({ createdAt: -1 })
    .limit(LIMIT)
    .populate("user", "-createdAt -updatedAt -email -password -posts")
    .lean();
  const posts = postQuery.map((post) => postDocToObj(post));
  const cursor =
    posts?.length > 0
      ? posts[posts.length - 1].createdAt || "timestamp"
      : "timestamp";

  return {
    props: { posts, cursor },
  };
}

const Home: React.FC = ({ posts, cursor }: IHomeProps) => {
  const { user, logout } = useContext(AppContext);

  return (
    <main>
      <section className="header">
        <h3>Recent Posts</h3>
      </section>
      <RowWrap>
        {posts.map((post, index) => (
          <PostCard key={index} post={post} />
        ))}
      </RowWrap>
      {!!user && <StyledButton label={"Logout"} onClick={logout} />}
    </main>
  );
};

export default Home;
