import { Centered, CircleLoader, PostFeed, StyledButton } from "components";
import PostCard from "components/PostCard";
import { AppContext } from "hooks";
import usePaginatePosts from "hooks/usePaginatePosts";
import Image from "next/image";
import React, { useContext } from "react";

const ProfilePage = () => {
  const { user } = useContext(AppContext);

  const { posts, loadMore } = usePaginatePosts(
    !!user?.username,
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
          <h2>{user?.username}</h2>
          <h3>Bio:</h3>
          <section className="post-body">{user?.bio || "(None)"}</section>
          <h3>Posts:</h3>
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
