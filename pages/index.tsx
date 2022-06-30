import { DarkText, PostFeed } from "components";
import { CACHE_DEFAULT, PAGINATE_LIMIT } from "consts";
import { MongoConnection } from "lib/server";
import { IPost } from "types";
import { processPostWithUser } from "utils";

interface IHomeProps {
  initPosts: IPost[];
}

export async function getServerSideProps({ res }) {
  res.setHeader("Cache-Control", CACHE_DEFAULT);

  const { Post } = await MongoConnection();
  const postQuery = await Post.find({ isPrivate: false })
    .sort({ createdAt: -1 })
    .limit(PAGINATE_LIMIT)
    .populate("user", "-createdAt -updatedAt -email -password -posts")
    .lean();
  const initPosts = postQuery.map((post) => processPostWithUser(post));

  return {
    props: { initPosts },
  };
}

const Home = ({ initPosts }: IHomeProps) => {
  return (
    <main>
      <section className="header">
        <DarkText text="Public Posts" variant="h3" />
      </section>
      <PostFeed initPosts={initPosts} />
    </main>
  );
};

export default Home;
