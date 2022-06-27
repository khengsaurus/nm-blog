import { DarkText, PostFeed, WindowLoaded } from "components";
import { AppContext } from "hooks";
import { useContext } from "react";

const MyPosts = () => {
  const { user } = useContext(AppContext);

  return (
    <main>
      <section className="header">
        <DarkText text="My Posts" variant="h3" />
      </section>
      <WindowLoaded ready={!!user}>
        <PostFeed
          hasAuthorLink={false}
          limitPosts={user?.posts.length}
          username={user?.username}
          publicPosts={false}
        />
      </WindowLoaded>
    </main>
  );
};

export default MyPosts;
