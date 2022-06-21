import {
  Column,
  EditPreviewMarkdown,
  EditProfileButtons,
  ImageForm,
  Row,
  StyledText,
} from "components";
import { DBService, Flag, HttpRequest, Status, ToastMessage } from "enums";
import { AppContext, useAsync, useIsoEffect, usePreviewImg } from "hooks";
import {
  avatarStyles,
  deleteImage,
  getUploadedImageKey,
  HTTPService,
} from "lib/client";
import { ServerError } from "lib/server";
import { useContext, useState } from "react";
import { toast } from "react-hot-toast";
import { IResponse } from "types";
import { getAvatarLarge, getStatusLabel } from "utils";

const EditProfile = () => {
  const { user, handleUser } = useContext(AppContext);
  const [username, setUsername] = useState(user?.username);
  const [bio, setBio] = useState(user?.bio);
  const [newImage, setNewImage] = useState<any>(null);
  const [imageKey, setImageKey] = useState("");
  const imageUpdated = !!newImage || imageKey !== user?.avatarKey;

  const previewImg = usePreviewImg(Flag.PREVIEW_IMG, newImage, false, 0);
  useIsoEffect(() => {
    if (user) {
      setImageKey(user.avatarKey);
      setUsername(user.username);
      setBio(user.bio);
    }
  }, [user]);

  async function saveProfile() {
    return new Promise(async (resolve, reject) => {
      let imageError = false,
        imageKey = user?.avatarKey || "";
      if (imageUpdated) {
        if (user?.avatarKey)
          deleteImage(user.avatarKey).catch((err) => console.info(err));
        await getUploadedImageKey(newImage)
          .then((key) => {
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
      <section className="header">
        <StyledText
          text={user?.username || "Username"}
          variant="h3"
          style={{ alignSelf: "flex-start", marginLeft: "3px" }}
        />
      </section>
      <Column>
        <EditPreviewMarkdown
          label="Bio"
          body={bio || ""}
          hasMarkdown={false}
          setBody={setBio}
        />
        <Row style={{ alignItems: "flex-start" }}>
          <Column style={{ alignItems: "flex-start" }}>
            <ImageForm
              label="avatar"
              newImage={newImage}
              hasImage={!!newImage || !!imageKey}
              setImage={setNewImage}
              setImageKey={setImageKey}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getAvatarLarge(imageKey)}
              alt={Flag.PREVIEW_IMG}
              id={Flag.PREVIEW_IMG}
              style={{
                ...avatarStyles.large,
                borderRadius: "50%",
                display: !previewImg && !imageKey ? "none" : "block",
              }}
            />
          </Column>
          <EditProfileButtons
            saveDisabled={saveDisabled || saveStatus === Status.ERROR}
            saveLabel={getStatusLabel(saveStatus)}
            handleSave={handleSave}
          />
        </Row>
      </Column>
    </main>
  );
};

export default EditProfile;
