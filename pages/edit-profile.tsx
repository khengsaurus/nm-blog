import {
  Column,
  EditPreviewMarkdown,
  EditProfileButtons,
  ImageForm,
  StyledText,
} from "components";
import { DBService, HttpRequest, Status, ToastMessage } from "enums";
import { AppContext, useAsync } from "hooks";
import { HTTPService } from "lib/client";
import { deleteImage, getUploadedImageKey } from "lib/client/tasks";
import { ServerError } from "lib/server";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { IResponse } from "types";
import { getStatusLabel } from "utils";

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
        imageName = user?.avatar || "",
        imageKey = user?.avatarKey || "";
      if (imageUpdated) {
        if (user?.avatarKey)
          deleteImage(user.avatarKey).catch((err) => console.info(err));
        await getUploadedImageKey(newAvatar)
          .then((key) => {
            imageName = newAvatar?.name;
            imageKey = key;
          })
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
            toast.success(ToastMessage.PROFILE_SAVE);
            resolve(res);
          })
          .catch((err) => {
            toast.error(ToastMessage.PROFILE_SAVE_FAIL);
            reject(err);
          });
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
          saveLabel={getStatusLabel(saveStatus)}
          handleSave={handleSave}
        />
      </Column>
    </main>
  );
};

export default EditProfile;
