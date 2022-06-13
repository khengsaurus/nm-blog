import {
  CircleLoader,
  Column,
  DeletePostModal,
  EditPostButtons,
  EditPreviewMarkdown,
  EditProfileButtons,
  ImageForm,
  Input,
} from "components";
import { DBService, ErrorMessage, HttpRequest, PageRoute, Status } from "enums";
import { AppContext, useAsync, useRealtimePost } from "hooks";
import { HTTPService, uploadImage } from "lib/client";
import { deleteImage } from "lib/client/tasks";
import { ServerError } from "lib/server";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { IResponse } from "types";

const getSaveButtonLabel = (saveStatus: Status) => {
  switch (saveStatus) {
    case Status.IDLE:
      return "Save";
    case Status.PENDING:
      return <CircleLoader />;
    case Status.SUCCESS:
      return "👌🏻";
    case Status.ERROR:
      return "⚠️";
  }
};

const EditProfile = () => {
  const { user } = useContext(AppContext);
  const [username, setUsername] = useState(user?.username);
  const [bio, setBio] = useState(user?.bio);
  const [newAvatar, setNewAvatar] = useState<any>(null);
  const [avatarName, setAvatarName] = useState("");
  const [bioHasMD, setBioHasMD] = useState(false);
  const imageUpdated = !!newAvatar || avatarName !== user?.avatar;

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setBio(user.bio);
      setAvatarName(user.avatar);
    }
  }, [user]);

  async function saveProfile() {
    return new Promise(async (resolve, reject) => {
      console.log("Save called");
      resolve(null);
    });
  }

  const { execute: handleSave, status: saveStatus } = useAsync<
    IResponse,
    ServerError
  >(saveProfile, null, (r: IResponse) => r.status === 200, false);

  const saveDisabled =
    !username?.trim() ||
    (username === user?.username && bio === user?.bio && !imageUpdated);

  return (
    <main className="left">
      <Column>
        <Input
          label="Username"
          value={username || ""}
          onChange={(e) => setUsername(e.target.value)}
          inputProps={{ maxLength: 50 }}
          maxWidth
        />
        <br />
        <EditPreviewMarkdown
          body={bio || ""}
          hasMarkdown={bioHasMD}
          setBody={setBio}
        />
        <ImageForm
          imageName={avatarName}
          setImageName={setAvatarName}
          setNewImage={setNewAvatar}
        />
        <EditProfileButtons
          bioHasMD={bioHasMD}
          saveDisabled={saveDisabled || saveStatus === Status.ERROR}
          handleSave={handleSave}
          setBioHasMD={setBioHasMD}
        />
      </Column>
    </main>
  );
};

export default EditProfile;
