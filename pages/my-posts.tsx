import { DarkText, PostFeed, StyledButton, WindowLoaded } from "components";
import { AppContext } from "hooks";
import usePaginatePosts from "hooks/usePaginatePosts";
import { useContext } from "react";

const MyPosts = () => {
  const { user } = useContext(AppContext);

  const { posts, loadMore } = usePaginatePosts(
    !!user?.username,
    false,
    [],
    user?.username
  );

  return (
    <main>
      <section className="header">
        <DarkText text="My Posts" variant="h3" />
      </section>
      <WindowLoaded ready={!!user}>
        <PostFeed posts={posts} hasAuthorLink={false} />
        {posts.length < user?.posts.length && (
          <StyledButton label="Load more" onClick={loadMore} />
        )}
      </WindowLoaded>
    </main>
  );
};

export default MyPosts;
