import { DBService } from "enums";
import { HTTPService } from "lib/client";
import React, { useCallback, useContext } from "react";
import { PostFeed, StyledButton } from "../components";
import PostCard from "../components/PostCard";
import { AppContext, usePaginatePosts } from "../hooks";
import { mongoConnection } from "../lib/server";
import { IPost } from "../types";
import { postDocToObj } from "../utils";

interface IHomeProps {
  initPosts: IPost[];
  cursor: string;
}

const PAGINATE_LIMIT = 2;

export async function getServerSideProps({ res }) {
  console.info("-> Home getServerSideProps()");
  res.setHeader(
    "Cache-Control",
    "public, max-age=300, s-maxage=600, stale-while-revalidate=30"
  );

  const { Post } = await mongoConnection();
  const postQuery = await Post.find()
    .sort({ createdAt: -1 })
    .limit(PAGINATE_LIMIT)
    .populate("user", "-createdAt -updatedAt -email -password -posts")
    .lean();
  const initPosts = postQuery.map((post) => postDocToObj(post));

  return {
    props: { initPosts },
  };
}

const Home: React.FC = ({ initPosts }: IHomeProps) => {
  const { user, logout } = useContext(AppContext);
  const { posts, loadMore } = usePaginatePosts(true, initPosts);

  return (
    <main>
      <section className="header">
        <h3>Recent Posts</h3>
      </section>
      <PostFeed>
        {posts.map((post, index) => (
          <PostCard key={index} post={post} />
        ))}
      </PostFeed>
      <StyledButton label={"Load more"} onClick={loadMore} />
      {!!user && <StyledButton label={"Logout"} onClick={logout} />}
    </main>
  );
};

export default Home;
