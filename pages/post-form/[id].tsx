import {
  CircleLoader,
  Column,
  EditPostButtons,
  EditPreviewMarkdown,
  ImageForm,
  Input,
} from "components";
import { DBService, ErrorMessage, HttpRequest, Status } from "enums";
import { AppContext, useAsync, useRealtimePost } from "hooks";
import { HTTPService, uploadImage } from "lib/client";
import { deleteImage } from "lib/client/tasks";
import { ServerError } from "lib/server";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { IResponse } from "types";

interface IPostPage {
  id: string;
}

export async function getServerSideProps({ params }) {
  const { id } = params;
  return { props: { id } };
}

const EditPost = ({ id }: IPostPage) => {
  const { user } = useContext(AppContext);
  const existingPost = useRealtimePost({ id, user });
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [newImage, setNewImage] = useState<any>(null);
  const [_imageName, setImageName] = useState("");
  const [hasMarkdown, setHasMarkdown] = useState(false);
  const hasEditedSlug = useRef(false);
  const isNewPost = id === "new";

  useEffect(() => {
    if (!hasEditedSlug.current) {
      setSlug(title?.toLocaleLowerCase().replaceAll(" ", "-"));
    }
  }, [title]);

  useEffect(() => {
    if (!isNewPost) {
      const { title, slug, body, imageName, isPrivate, hasMarkdown } =
        existingPost || {};
      setTitle(title);
      setSlug(slug);
      setBody(body);
      setImageName(imageName);
      setIsPrivate(isPrivate);
      setHasMarkdown(hasMarkdown);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewPost, existingPost]);

  const _handlePost = useCallback(() => {
    return new Promise(async (resolve, reject) => {
      if (!!user?.posts?.find((post) => post.slug === slug)) {
        reject(new Error(ErrorMessage.POST_SLUG_USED));
        return;
      }
      const hasAttachment = !!newImage;
      let imageKey = "";
      if (hasAttachment) {
        await uploadImage(newImage)
          .then((_imageKey) => {
            imageKey = _imageKey;
          })
          .catch((err) => reject(err));
      }
      // no newImage or newImage saved
      if (!hasAttachment || !!imageKey) {
        HTTPService.makeAuthHttpReq(DBService.POSTS, HttpRequest.POST, {
          username: user.username,
          title,
          slug,
          body,
          imageKey,
          imageName: newImage?.name || "",
          isPrivate,
          hasMarkdown,
        })
          .then((res) => resolve(res))
          .catch((err) => reject(err));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newImage, body, slug, title, JSON.stringify(user)]);

  async function _handlePatch() {
    return new Promise(async (resolve, reject) => {
      if (!!user?.posts?.find((post) => post.id !== id && post.slug === slug)) {
        reject(new Error(ErrorMessage.POST_SLUG_USED));
        return;
      }
      let imageError = false,
        imageKey = existingPost?.imageKey || "",
        imageName = existingPost?.imageName || "";
      if (!!newImage || _imageName !== imageName) {
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
      if (!!newImage) {
        await uploadImage(newImage)
          .then((_imageKey) => {
            imageKey = _imageKey;
            imageName = newImage.name;
          })
          .catch((err) => {
            imageError = true;
            reject(err);
            return;
          });
      }
      if (!imageError) {
        await HTTPService.makeAuthHttpReq(DBService.POSTS, HttpRequest.PATCH, {
          id,
          title,
          slug,
          body,
          imageKey,
          imageName,
          isPrivate,
          hasMarkdown,
        })
          .then((res) => resolve(res))
          .catch((err) => reject(err));
      }
    });
  }

  const _cleanup = useCallback(() => {
    setTitle("");
    setSlug("");
    setBody("");
    setNewImage(null);
  }, []);

  const { execute: handleSave, status: saveStatus } = useAsync<
    IResponse,
    ServerError
  >(
    isNewPost ? _handlePost : _handlePatch,
    isNewPost ? _cleanup : null,
    (r: IResponse) => r.status === 200,
    false
  );

  const saveDisabled = useMemo(
    () =>
      !title?.trim() ||
      !slug?.trim() ||
      !body?.trim() ||
      saveStatus !== Status.IDLE,
    [title, slug, body, saveStatus]
  );

  const saveButtonLabel = useMemo(() => {
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
  }, [saveStatus]);

  return (
    <main className="left">
      <Column>
        <Input
          label="Title"
          value={title || ""}
          onChange={(e) => setTitle(e.target.value)}
          inputProps={{ maxLength: 50 }}
          maxWidth
        />
        <Input
          label="Slug"
          value={slug || ""}
          onChange={(e) => {
            setSlug(e.target.value);
            if (!e.target.value) {
              hasEditedSlug.current = false;
            }
          }}
          onClick={() => (hasEditedSlug.current = true)}
          maxWidth
        />
        <br />
        <EditPreviewMarkdown
          body={body}
          hasMarkdown={hasMarkdown}
          setBody={setBody}
        />
        <ImageForm
          newImage={newImage}
          setNewImage={setNewImage}
          imageName={_imageName}
          setImageName={setImageName}
        />
        <EditPostButtons
          isPrivate={isPrivate}
          setIsPrivate={setIsPrivate}
          hasMarkdown={hasMarkdown}
          setHasMarkdown={setHasMarkdown}
          saveButtonLabel={saveButtonLabel}
          saveDisabled={saveDisabled}
          handleSave={handleSave}
        />
      </Column>
    </main>
  );
};

export default EditPost;
