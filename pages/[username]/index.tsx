import { Avatar } from "@mui/material";
import { Column, DarkText, PostFeed } from "components";
import { CACHE_DEFAULT, PAGINATE_LIMIT } from "consts";
import { avatarStyles } from "lib/client";
import { MongoConnection } from "lib/server";
import { IUser } from "types";
import { getAvatarLarge, processPostWithUser, userDocToObj } from "utils";
import FourOFour from "../404";

interface IUserPageProps {
  visitingUser: IUser;
}

export async function getServerSideProps({ params, res }) {
  const { username } = params;
  res.setHeader("Cache-Control", CACHE_DEFAULT);

  const { Post, User } = await MongoConnection();

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
      const _posts = posts.map((post) => processPostWithUser(post));
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
  const { avatarKey, bio, posts, username } = visitingUser || {};

  return visitingUser ? (
    <main>
      <section className="header">
        {avatarKey && (
          <Avatar
            alt={`${username}-avatar`}
            src={getAvatarLarge(avatarKey)}
            sx={{ ...avatarStyles.large, marginRight: "20px" }}
          />
        )}
        <Column style={{ alignItems: avatarKey ? "flex-start" : "center" }}>
          <DarkText text={username} variant="h2" />
          <DarkText text={bio} variant="body1" paragraph />
        </Column>
      </section>
      <PostFeed initPosts={posts} username={username} />
    </main>
  ) : (
    <FourOFour />
  );
};

export default UserPage;
