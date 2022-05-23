import { Centered, CircleLoader } from "components";
import { AppContext } from "hooks";
import Image from "next/image";
import React, { useContext } from "react";

const ProfilePage = () => {
  const { user } = useContext(AppContext);

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
