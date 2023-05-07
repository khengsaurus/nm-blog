import axios from "axios";
import { PostFeed } from "components";
import { CACHE_DEFAULT, SERVER_URL } from "consts";
import { useNavShortcuts, usePageReady } from "hooks";
import { IPost } from "types";

interface IHomeProps {
  initPosts: IPost[];
}

export async function getServerSideProps({ res }) {
  res.setHeader("Cache-Control", CACHE_DEFAULT);

  const initPosts = await axios
    .get(`${SERVER_URL}/posts/home`)
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
