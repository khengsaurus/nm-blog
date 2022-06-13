import EditIcon from "@mui/icons-material/Edit";
import Fab from "@mui/material/Fab";
import { Centered, CircleLoader, DarkContainer, StyledText } from "components";
import { AppContext } from "hooks";
import Image from "next/image";
import { useContext } from "react";

const MyProfile = () => {
  const { user } = useContext(AppContext);

  return (
    <main className="left">
      {user ? (
        <>
          <DarkContainer>
            <StyledText text={user?.username} variant="h2" />
          </DarkContainer>

          {user?.avatar ? (
            <Image src={`api/images?key=${user.avatar}`} alt="avatar" />
          ) : (
            <DarkContainer>
              <StyledText text={"(No avatar)"} variant="h4" />
            </DarkContainer>
          )}

          <DarkContainer>
            <StyledText text={user?.bio || "(No bio)"} variant="h4" />
          </DarkContainer>
          <div className="post-edit-container">
            <Fab className="post-edit-button" onClick={null} disableRipple>
              <EditIcon style={{ width: 40, height: 40 }} />
            </Fab>
          </div>
        </>
      ) : (
        <Centered style={{ marginTop: "calc(50vh - 120px)" }}>
          <CircleLoader height={100} width={100} strokeWidth={2} />
        </Centered>
      )}
    </main>
  );
};

export default MyProfile;
