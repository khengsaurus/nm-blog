import {
  DarkContainer,
  PostCard,
  PostFeed,
  StyledButton,
  StyledText,
} from "components";
import { PAGINATE_LIMIT } from "consts";
import { usePaginatePosts, useWindowLoaded } from "hooks";
import { mongoConnection } from "lib/server";
import { IPost } from "types";
import { postDocToObj } from "utils";

interface IHomeProps {
  initPosts: IPost[];
  cursor: string;
}

export async function getServerSideProps({ res }) {
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=30, stale-while-revalidate=90"
  );

  const { Post } = await mongoConnection();
  const postQuery = await Post.find({ isPrivate: false })
    .sort({ createdAt: -1 })
    .limit(PAGINATE_LIMIT)
    .populate("user", "-createdAt -updatedAt -email -password -posts")
    .lean();
  const initPosts = postQuery.map((post) => postDocToObj(post));

  return {
    props: { initPosts },
  };
}

const Home = ({ initPosts }: IHomeProps) => {
  const { posts, limitReached, loadMore } = usePaginatePosts(
    typeof window !== undefined,
    true,
    initPosts
  );
  const windowLoaded = useWindowLoaded();

  return (
    <main>
      <section className="header">
        <DarkContainer>
          <StyledText text="Public Posts" variant="h3" />
        </DarkContainer>
      </section>
      <PostFeed style={windowLoaded ? null : { width: 1000 }}>
        {posts.map((post, index) => (
          <PostCard key={index} post={post} />
        ))}
      </PostFeed>
      <br />
      {!limitReached && <StyledButton label="Load more" onClick={loadMore} />}
    </main>
  );
};

export default Home;
