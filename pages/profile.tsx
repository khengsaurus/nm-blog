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
import Image from "next/image";
import React, { useContext } from "react";

const ProfilePage = () => {
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
          {user?.avatar && (
            <Image src={`api/images?key=${user.avatar}`} alt="avatar" />
          )}
          <StyledText text={user?.username} variant="h2" />
          <StyledText text="Bio:" variant="h5" />
          <StyledText text={user?.bio || "(None)"} variant="body1" />
          <br />
          <StyledText text="Posts:" variant="h5" />
          <PostFeed>
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
            <StyledButton label={"Load more"} onClick={loadMore} />
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

export default ProfilePage;
