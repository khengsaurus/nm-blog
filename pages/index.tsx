import { PostFeed } from "components";
import { CACHE_DEFAULT, HOME, PAGINATE_LIMIT } from "consts";
import { useNavShortcuts, usePageReady } from "hooks";
import { MongoConnection, RedisConnection } from "lib/server";
import { IPost } from "types";
import { processPostWithUser } from "utils";

interface IHomeProps {
  initPosts: IPost[];
}

export async function getServerSideProps({ res }) {
  res.setHeader("Cache-Control", CACHE_DEFAULT);
  const client = new RedisConnection();
  // console.log("getServerSideProps -> new RedisConnection()");
  let initPosts = await client.get([], HOME);

  if (!initPosts.length) {
    const { Post } = await MongoConnection();
    const postQuery = await Post.find({ isPrivate: false })
      .select(["-user"])
      .sort({ createdAt: -1 })
      .limit(PAGINATE_LIMIT)
      .lean();
    initPosts = postQuery.map((post) => processPostWithUser(post));
    client.setKeyValue(HOME, initPosts);
  }
  client.setCloseTimeout();

  return {
    props: { initPosts },
  };
}

const Home = ({ initPosts }: IHomeProps) => {
  useNavShortcuts();
  usePageReady();

  return (
    <main>
      <PostFeed initPosts={initPosts} title="Public posts" hasSearch />
    </main>
  );
};

export default Home;
