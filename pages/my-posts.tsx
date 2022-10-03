import { PageLoader, PostFeed } from "components";
import { AppContext, useNavShortcuts, usePageReady } from "hooks";
import { useContext } from "react";

const MyPosts = () => {
  const { user } = useContext(AppContext);
  useNavShortcuts();
  usePageReady();

  return (
    <main>
      {user ? (
        <PostFeed
          hasAuthorLink={false}
          limitPosts={user.posts?.length}
          publicPosts={false}
          username={user.username}
          windowReady={!!user}
          title="My posts"
          hasSearch
        />
      ) : (
        <PageLoader />
      )}
    </main>
  );
};

export default MyPosts;
