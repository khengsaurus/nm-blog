import { DarkText, PostFeed } from "components";
import { AppContext, useNavShortcuts, usePageReady } from "hooks";
import { useContext } from "react";

const MyPosts = () => {
  const { user } = useContext(AppContext);
  useNavShortcuts();
  usePageReady();

  return (
    <main>
      <section className="header">
        <DarkText text="My Posts" variant="h3" />
      </section>
      <PostFeed
        hasAuthorLink={false}
        limitPosts={user?.posts.length}
        publicPosts={false}
        username={user?.username}
        windowReady={!!user}
      />
    </main>
  );
};

export default MyPosts;
