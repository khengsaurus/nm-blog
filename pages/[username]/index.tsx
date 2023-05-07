import { Avatar } from "@mui/material";
import axios from "axios";
import { Column, DarkText, PostFeed } from "components";
import { CACHE_DEFAULT, SERVER_URL } from "consts";
import { useNavShortcuts, usePageReady } from "hooks";
import { avatarStyles } from "lib/client";
import { IUser } from "types";
import { getAvatarLarge } from "utils";
import FourOFour from "../404";

interface IUserPageProps {
  visitingUser: IUser;
}

export async function getServerSideProps({ params, res }) {
  const { username } = params;
  res.setHeader("Cache-Control", CACHE_DEFAULT);

  const user = await axios
    .get(`${SERVER_URL}/posts/user`, {
      params: { username },
    })
    .then((res) => {
      const { message, user, error } = res?.data;
      if (error) {
        console.error(
          `Error building [username] getServerSideProps: ${message}`
        );
        return {};
      }
      return user;
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
  useNavShortcuts();
  usePageReady();

  return visitingUser ? (
    <main>
      <section className="header center">
        {avatarKey && (
          <Avatar
            alt={`${username}-avatar`}
            src={getAvatarLarge(avatarKey)}
            sx={{ ...avatarStyles.large, marginRight: "20px" }}
          />
        )}
        <Column
          style={{
            width: "fit-content",
            alignItems: avatarKey ? "flex-start" : "center",
          }}
        >
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
