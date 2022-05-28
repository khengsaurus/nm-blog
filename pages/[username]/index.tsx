import { PostFeed, StyledButton } from "components";
import PostCard from "components/PostCard";
import { usePaginatePosts } from "hooks";
import { mongoConnection } from "lib/server";
import React from "react";
import { IUser } from "types";
import { postDocToObj, userDocToObj } from "../../utils";

const PAGINATE_LIMIT = 2;

interface IUserPageProps {
  visitingUser: IUser;
}

export async function getServerSideProps({ params, res }) {
  const { username } = params;
  console.info(`-> [${username}] getServerSideProps() `);
  res.setHeader(
    "Cache-Control",
    "public, max-age=300, s-maxage=600, stale-while-revalidate=30"
  );

  const { Post, User } = await mongoConnection();

  const userQuery = await User.findOne({ username })
    .select(["-password -posts"])
    .lean();
  const user = userDocToObj(userQuery);
  await Post.find({ username })
    .sort({ createdAt: -1 })
    .limit(PAGINATE_LIMIT)
    .populate("user", "-createdAt -updatedAt -email -password -posts")
    .lean()
    .then((posts) => {
      const _posts = posts.map((post) => postDocToObj(post));
      user.posts = _posts;
    });

  return { props: { visitingUser: user } };
}

const UserPage = (props: IUserPageProps) => {
  const { visitingUser } = props;
  const { posts, loadMore } = usePaginatePosts(
    !!visitingUser?.username,
    visitingUser?.posts,
    visitingUser?.username
  );

  return (
    <main>
      <section className="header">
        <h3>{`Posts by ${visitingUser?.username}`}</h3>
      </section>
      <PostFeed>
        {posts.map((post, index) => (
          <PostCard
            key={index}
            post={post}
            hasAuthorLink={false}
            postTag="username"
          />
        ))}
      </PostFeed>
      <StyledButton label={"Load more"} onClick={loadMore} />
    </main>
  );
};

export default UserPage;
