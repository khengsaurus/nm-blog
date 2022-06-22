import {
  DarkContainer,
  PostFeed,
  StyledButton,
  StyledText,
  WindowLoaded,
} from "components";
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
        <DarkContainer>
          <StyledText text="My Posts" variant="h3" />
        </DarkContainer>
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
