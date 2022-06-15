import {
  CircleLoader,
  Column,
  EditPreviewMarkdown,
  EditProfileButtons,
  ImageForm,
  StyledText,
} from "components";
import { DBService, HttpRequest, Status } from "enums";
import { AppContext, useAsync } from "hooks";
import { HTTPService, uploadImage } from "lib/client";
import { deleteImage } from "lib/client/tasks";
import { ServerError } from "lib/server";
import { useContext, useEffect, useState } from "react";
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
  const { user, handleUser } = useContext(AppContext);
  const [username, setUsername] = useState(user?.username);
  const [bio, setBio] = useState(user?.bio);
  const [newAvatar, setNewAvatar] = useState<any>(null);
  const [avatarName, setAvatarName] = useState("");
  const [bioHasMD, setBioHasMD] = useState(false);
  const imageUpdated = !!newAvatar || avatarName !== user?.avatar;

  useEffect(() => {
    if (user) {
      setAvatarName(user.avatar);
      setUsername(user.username);
      setBio(user.bio);
      setBioHasMD(user.bioMD);
    }
  }, [user]);

  async function saveProfile() {
    return new Promise(async (resolve, reject) => {
      let imageError = false,
        imageName = user?.avatar || "",
        imageKey = user?.avatarKey || "";
      if (imageUpdated) {
        await deleteImage(imageKey)
          .then(() => {
            imageKey = "";
            imageName = "";
          })
          .catch((err) => {
            imageError = true;
            reject(err);
            return;
          });
      }
      if (!!newAvatar) {
        await uploadImage(newAvatar)
          .then((_imageKey) => {
            imageKey = _imageKey;
            imageName = newAvatar.name;
          })
          .catch((err) => {
            imageError = true;
            reject(err);
            return;
          });
      }
      if (!imageError) {
        await HTTPService.makeAuthHttpReq(DBService.USERS, HttpRequest.PATCH, {
          bio,
          bioMD: bioHasMD,
          avatar: imageName,
          avatarKey: imageKey,
        })
          .then((res) => {
            if (res.data?.token && res.data?.user) {
              handleUser(res.data.token, res.data.user);
            }
            resolve(res);
          })
          .catch((err) => reject(err));
      }
    });
  }

  const { execute: handleSave, status: saveStatus } = useAsync<
    IResponse,
    ServerError
  >(saveProfile, null, (r: IResponse) => r.status === 200, false);

  const saveDisabled =
    !username?.trim() ||
    (username === user?.username &&
      bio === user?.bio &&
      bioHasMD === user?.bioMD &&
      !imageUpdated);

  return (
    <main className="left">
      <Column>
        {/* <Input
          label="Username"
          value={username || ""}
          onChange={(e) => setUsername(e.target.value)}
          inputProps={{ maxLength: 50 }}
          maxWidth
        /> */}
        <StyledText
          text={user?.username}
          variant="h3"
          style={{ alignSelf: "flex-start", marginLeft: "3px" }}
        />
        <br />
        <EditPreviewMarkdown
          label="Bio"
          body={bio || ""}
          hasMarkdown={bioHasMD}
          setBody={setBio}
        />
        <ImageForm
          label="Add avatar"
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
