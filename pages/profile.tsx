import { postDocToObj } from "../utils";
import { Centered, CircleLoader, RowWrap, StyledButton } from "components";
import { AppContext } from "hooks";
import { mongoConnection } from "lib/server";
import { IPost } from "../types";
import Image from "next/image";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { HTTPService } from "lib/client";
import { DBService } from "enums";
import PostCard from "components/PostCard";

const LIMIT = 3;

const ProfilePage = () => {
  const { user } = useContext(AppContext);
  const [posts, setPosts] = useState<IPost[]>([]);

  const getPosts = async () => {
    const createdAt =
      posts.length === 0 ? null : posts[posts.length - 1].createdAt;
    HTTPService.makeGetReq(DBService.POSTS, {
      username: user?.username,
      limit: LIMIT,
      createdAt,
    }).then((res) => {
      if (res.status === 200 && res.data?.posts?.length > 0) {
        const _posts = [...posts, ...res.data.posts];
        setPosts(_posts);
      }
    });
  };

  useEffect(() => {
    user?.username && getPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.username]);

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
          <RowWrap>
            {posts.map((post, index) => (
              <PostCard key={index} post={post} hasAuthorLink={false} />
            ))}
          </RowWrap>
          {posts.length < user?.posts.length && (
            <StyledButton label={"Load more"} onClick={getPosts} />
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
