import { serverUrl } from "lib/client";
import Image from "next/image";
import React, { useContext } from "react";
import { HomePage, RowWrap, StyledButton } from "../components";
import PostCard from "../components/PostCard";
import { PageTitle } from "../enums";
import { AppContext } from "../hooks";
import { mongoConnection } from "../lib/server";
import { IPost } from "../types";
import { docToObject } from "../util";

interface IHomeProps {
  posts: IPost[];
  cursor: string;
}

const LIMIT = 5;

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
    .populate("user", "-createdAt -email -password")
    .lean()
    .exec();
  const posts = postQuery.map((post) => docToObject(post));
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

  const markup = (
    <>
      <RowWrap>
        {posts.map((post, index) => (
          <PostCard key={index} post={post} />
        ))}
        <Image
          alt=""
          height={200}
          width={200}
          src={`${serverUrl}/api/images?key=39af32e95bb01cf50464b17709583838`}
        />
      </RowWrap>
      {!!user && <StyledButton label={"Logout"} onClick={logout} />}
    </>
  );

  return <HomePage title={PageTitle.HOME} markup={markup} />;
};

export default Home;
