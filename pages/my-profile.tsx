import { Centered, CircleLoader, StyledText } from "components";
import { AppContext } from "hooks";
import Image from "next/image";
import { useContext } from "react";

const MyProfile = () => {
  const { user } = useContext(AppContext);

  return (
    <main className="left">
      {user ? (
        <>
          {user?.avatar && (
            <Image src={`api/images?key=${user.avatar}`} alt="avatar" />
          )}
          <StyledText text={user?.username} variant="h3" />
          <StyledText text="Bio:" variant="h4" />
          <StyledText text={user?.bio || "(None)"} variant="body1" />
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
