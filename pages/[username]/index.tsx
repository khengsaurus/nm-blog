import { Avatar } from "@mui/material";
import {
  Column,
  DarkContainer,
  PostCard,
  PostFeed,
  StyledButton,
  StyledText,
} from "components";
import { PAGINATE_LIMIT } from "consts";
import { usePaginatePosts } from "hooks";
import { mongoConnection } from "lib/server";
import { IUser } from "types";
import { postDocToObj, userDocToObj } from "utils";
import FourOFour from "../404";

interface IUserPageProps {
  visitingUser: IUser;
}

export async function getServerSideProps({ params, res }) {
  const { username } = params;
  res.setHeader(
    "Cache-Control",
    "public, max-age=300, s-maxage=600, stale-while-revalidate=30"
  );

  const { Post, User } = await mongoConnection();

  const userQuery = await User.findOne({ username })
    .select(["-password -posts"])
    .lean();
  const user = userDocToObj(userQuery);
  await Post.find({ username, isPrivate: false })
    .sort({ createdAt: -1 })
    .limit(PAGINATE_LIMIT)
    .populate("user", "-createdAt -updatedAt -email -password -posts")
    .lean()
    .then((posts) => {
      const _posts = posts.map((post) => postDocToObj(post));
      if (user) user.posts = _posts;
    });

  return {
    props: {
      visitingUser: user,
    },
  };
}

const UserPage = (props: IUserPageProps) => {
  const { visitingUser } = props;
  const { avatarKey, bio, username } = visitingUser || {};
  const { posts, limitReached, loadMore } = usePaginatePosts(
    !!visitingUser?.username,
    true,
    visitingUser?.posts,
    visitingUser?.username
  );

  return visitingUser ? (
    <main>
      <section className="header">
        {avatarKey && (
          <Avatar
            alt={`${username}-avatar`}
            src={`${process.env.ENV_IMG_SRC}${avatarKey}?tr=w-140,h-140`}
            sx={{ width: 140, height: 140, marginRight: "20px" }}
          />
        )}
        <Column style={{ alignItems: avatarKey ? "flex-start" : "center" }}>
          <DarkContainer>
            <StyledText text={username} variant="h2" />
          </DarkContainer>
          <DarkContainer>
            <StyledText text={bio} variant="body1" paragraph />
          </DarkContainer>
        </Column>
      </section>
      <PostFeed>
        {posts.map((post, index) => (
          <PostCard
            key={index}
            post={post}
            hasAuthorLink={false}
            hasDate={true}
            postTag="username"
          />
        ))}
      </PostFeed>
      {!limitReached && <StyledButton label="Load more" onClick={loadMore} />}
    </main>
  ) : (
    <FourOFour />
  );
};

export default UserPage;
