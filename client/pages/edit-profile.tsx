/* eslint-disable @next/next/no-img-element */
import {
  Column,
  EditPreviewMarkdown,
  EditProfileButtons,
  ImageForm,
  Row,
  StyledText,
} from "components";
import { IS_DEV } from "consts";
import { DbService, Flag, HttpRequest, Status, ToastMessage } from "enums";
import {
  AppContext,
  useAsync,
  useIsoEffect,
  usePageReady,
  usePreviewImg,
} from "hooks";
import {
  authHttpService,
  avatarStyles,
  deleteFiles,
  getUploadedFileKey,
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
  usePageReady();

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
        if (user?.avatarKey) deleteFiles([user.avatarKey]).catch(console.error);
        await getUploadedFileKey(user.id, newImage)
          .then((key) => {
            imageKey = key;
          })
          .catch((err) => {
            reject(err);
            if (!IS_DEV) imageError = true;
          });
      }
      if (!imageError) {
        await authHttpService
          .makeAuthHttpReq(DbService.USER, HttpRequest.PATCH, {
            bio,
            avatarKey: imageKey,
          })
          .then((res) => {
            if (res.data?.token && res.data?.user) {
              handleUser(res.data.token, res.data.user);
            }
            toast.success(ToastMessage.PROFILE_SAVED);
            resolve(res);
          })
          .catch((err) => {
            toast.error(ToastMessage.PROFILE_SAVE_FAILED);
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
          markdown={false}
          setBody={setBio}
        />
        <Row style={{ alignItems: "flex-start" }}>
          <Column style={{ alignItems: "flex-start" }}>
            <img
              src={getAvatarLarge(imageKey)}
              alt={Flag.PREVIEW_IMG}
              id={Flag.PREVIEW_IMG}
              style={{
                ...avatarStyles.large,
                margin: "16px",
                borderRadius: "50%",
                display: !previewImg && !imageKey ? "none" : "block",
              }}
            />
            <ImageForm
              label="avatar"
              hasImg={!!newImage || !!imageKey}
              setImg={setNewImage}
              rmImg={() => {
                setImageKey("");
                setNewImage(null);
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
