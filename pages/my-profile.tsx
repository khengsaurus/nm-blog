import EditIcon from "@mui/icons-material/Edit";
import { Avatar, Fab } from "@mui/material";
import { Column, DarkText, PageLoader } from "components";
import { PageRoute } from "enums";
import { AppContext, useNavShortcuts, usePageReady } from "hooks";
import { avatarStyles } from "lib/client";
import { useContext } from "react";
import { getAvatarLarge } from "utils";

const MyProfile = () => {
  const { user, routerPush } = useContext(AppContext);
  const { bio, avatarKey, username } = user || {};
  useNavShortcuts();
  usePageReady();

  return (
    <main className="pad-top">
      {user ? (
        <>
          <section className="header intro">
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
              <DarkText text={bio || "(No bio)"} variant="h4" paragraph />
            </Column>
          </section>
          <div className="edit-container">
            <Fab
              className="edit-button"
              onClick={() => routerPush(PageRoute.EDIT_PROFILE)}
              disableRipple
            >
              <EditIcon style={{ width: 40, height: 40 }} />
            </Fab>
          </div>
        </>
      ) : (
        <PageLoader />
      )}
    </main>
  );
};

export default MyProfile;
