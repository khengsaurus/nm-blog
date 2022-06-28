import { DarkText, PostFeed } from "components";
import { AppContext } from "hooks";
import { useContext } from "react";

const MyPosts = () => {
  const { user } = useContext(AppContext);

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
