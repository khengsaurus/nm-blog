import { PostFeed } from "components";
import { CACHE_DEFAULT } from "consts";
import { useNavShortcuts, usePageReady } from "hooks";
import { commonHttpService } from "lib/client";
import { IPost } from "types";

interface IHomeProps {
  initPosts: IPost[];
}

export async function getServerSideProps(args) {
  const { res } = args;
  res.setHeader("Cache-Control", CACHE_DEFAULT);

  const initPosts = await commonHttpService
    .get("posts/home")
    .then((res) => {
      const { message, posts, error } = res?.data;
      if (error) throw new Error(message);
      return posts;
    })
    .catch((err) => {
      console.error(`Error building home page: ${err?.message}`);
      return [];
    });

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
