import {
  CircleLoader,
  Column,
  EditPreviewMarkdown,
  EditProfileButtons,
  ImageForm,
  StyledText,
} from "components";
import { DBService, ErrorMessage, HttpRequest, Status } from "enums";
import { AppContext, useAsync } from "hooks";
import { HTTPService } from "lib/client";
import {
  deleteImage,
  getPresignedS3URL,
  getUploadedImageKey,
} from "lib/client/tasks";
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
  const imageUpdated = !!newAvatar || avatarName !== user?.avatar;

  useEffect(() => {
    if (user) {
      setAvatarName(user.avatar);
      setUsername(user.username);
      setBio(user.bio);
    }
  }, [user]);

  async function saveProfile() {
    return new Promise(async (resolve, reject) => {
      let imageError = false,
        imageName = "",
        imageKey = "";
      if (imageUpdated) {
        if (user?.avatarKey)
          deleteImage(user.avatarKey).catch((err) => console.info(err));
        await getUploadedImageKey(newAvatar)
          .then((key) => (imageKey = key))
          .catch((err) => {
            reject(err);
            imageError = true;
          });
      }
      if (!imageError) {
        await HTTPService.makeAuthHttpReq(DBService.USERS, HttpRequest.PATCH, {
          bio,
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
    (username === user?.username && bio === user?.bio && !imageUpdated);

  return (
    <main className="left">
      <Column>
        <StyledText
          text={user?.username}
          variant="h3"
          style={{ alignSelf: "flex-start", marginLeft: "3px" }}
        />
        <br />
        <EditPreviewMarkdown
          label="Bio"
          body={bio || ""}
          hasMarkdown={false}
          setBody={setBio}
        />
        <ImageForm
          label="Add avatar"
          imageName={avatarName}
          setImageName={setAvatarName}
          setNewImage={setNewAvatar}
        />
        <EditProfileButtons
          saveDisabled={saveDisabled || saveStatus === Status.ERROR}
          handleSave={handleSave}
        />
      </Column>
    </main>
  );
};

export default EditProfile;
