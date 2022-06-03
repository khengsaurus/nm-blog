import {
  Centered,
  CircleLoader,
  PostFeed,
  StyledButton,
  StyledText,
} from "components";
import PostCard from "components/PostCard";
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
    <main className="left">
      {user ? (
        <>
          <StyledText text="My Posts:" variant="h4" />
          <PostFeed style={{ justifyContent: "flex-start" }}>
            {posts.map((post, index) => (
              <PostCard
                key={index}
                post={post}
                hasAuthorLink={false}
                postTag="profile"
              />
            ))}
          </PostFeed>
          {posts.length < user?.posts.length && (
            <StyledButton label="Load more" onClick={loadMore} />
          )}
        </>
      ) : (
        <Centered style={{ marginTop: "calc(50vh - 120px)" }}>
          <CircleLoader height={100} width={100} strokeWidth={2} />
        </Centered>
      )}
    </main>
  );
};

export default MyPosts;
