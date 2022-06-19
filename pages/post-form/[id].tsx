import {
  CircleLoader,
  Column,
  DeletePostModal,
  EditPostButtons,
  EditPreviewMarkdown,
  ImageForm,
  Input,
} from "components";
import { DBService, ErrorMessage, HttpRequest, Status } from "enums";
import { AppContext, useAsync, useRealtimePost } from "hooks";
import { HTTPService } from "lib/client";
import { deleteImage, getUploadedImageKey } from "lib/client/tasks";
import { ServerError } from "lib/server";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { IResponse } from "types";

interface IPostPage {
  id: string;
}

export async function getServerSideProps({ params }) {
  const { id } = params;
  return { props: { id } };
}

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

const EditPost = ({ id }: IPostPage) => {
  const { user, updatePostSlugs } = useContext(AppContext);
  const { realtimePost, refreshPost } = useRealtimePost({ id, user });
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [newImage, setNewImage] = useState<any>(null);
  const [_imageName, setImageName] = useState("");
  const [hasMarkdown, setHasMarkdown] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const hasEditedSlug = useRef(false);
  const isNewPost = id === "new";
  const imageUpdated = !!newImage || _imageName !== realtimePost?.imageName;

  useEffect(() => {
    if (!hasEditedSlug.current) {
      setSlug(
        title
          ?.toLocaleLowerCase()
          .replace(/[\?\/]/g, "")
          .replaceAll(" ", "-")
      );
    }
  }, [title]);

  useEffect(() => {
    if (!isNewPost) {
      const { title, slug, body, imageName, isPrivate, hasMarkdown } =
        realtimePost || {};
      setTitle(title);
      setSlug(slug);
      setBody(body);
      setImageName(imageName);
      setIsPrivate(isPrivate);
      setHasMarkdown(hasMarkdown);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewPost, realtimePost]);

  const _handlePut = () => {
    return new Promise(async (resolve, reject) => {
      // If existing post with new slug || new post -> check if slug avail
      if (isNewPost || slug.trim() !== realtimePost?.slug?.trim()) {
        if (!!user?.posts?.find((post) => post.slug === slug)) {
          reject(new Error(ErrorMessage.POST_SLUG_USED));
          return;
        }
      }
      let imageKey = "";
      let imageError = false;
      if (imageUpdated) {
        // New image -> delete old image if exists. Do not await this.
        if (realtimePost?.imageKey)
          deleteImage(realtimePost.imageKey).catch((err) => console.info(err));
        await getUploadedImageKey(newImage)
          .then((key) => (imageKey = key))
          .catch((err) => {
            reject(err);
            imageError = true;
          });
      }
      if (!imageError) {
        const post = {
          id: isNewPost ? "" : realtimePost?.id,
          username: user?.username,
          title,
          slug,
          body,
          imageKey,
          imageName: newImage?.name || "",
          isPrivate,
          hasMarkdown,
        };
        await HTTPService.makeAuthHttpReq(
          DBService.POSTS,
          isNewPost ? HttpRequest.POST : HttpRequest.PATCH,
          post
        )
          .then((res) => resolve(res))
          .catch((err) => reject(err));
      }
    });
  };

  const _cleanup = useCallback(() => {
    if (isNewPost) {
      setTitle("");
      setSlug("");
      setBody("");
      setNewImage(null);
      setImageName("");
      setIsPrivate(false);
      setHasMarkdown(false);
    } else {
      refreshPost();
    }
    updatePostSlugs(user);
  }, [isNewPost, user, refreshPost, updatePostSlugs]);

  const { execute: handleSave, status: saveStatus } = useAsync<
    IResponse,
    ServerError
  >(_handlePut, _cleanup, (r: IResponse) => r.status === 200, false);

  const saveDisabled =
    !title?.trim() ||
    !slug?.trim() ||
    !body?.trim() ||
    saveStatus !== Status.IDLE ||
    (id !== "new" &&
      title === realtimePost?.title &&
      slug === realtimePost?.slug &&
      body === realtimePost?.body &&
      isPrivate === realtimePost?.isPrivate &&
      hasMarkdown === realtimePost?.hasMarkdown &&
      !imageUpdated);

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    setShowDelete(true);
  }

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
          label="Body"
          body={body}
          hasMarkdown={hasMarkdown}
          setBody={setBody}
        />
        <ImageForm
          label="Add image"
          imageName={_imageName}
          setImageName={setImageName}
          setNewImage={setNewImage}
        />
        <EditPostButtons
          isPrivate={isPrivate}
          setIsPrivate={setIsPrivate}
          hasMarkdown={hasMarkdown}
          setHasMarkdown={setHasMarkdown}
          saveButtonLabel={getSaveButtonLabel(saveStatus)}
          saveDisabled={saveDisabled}
          handleSave={handleSave}
          isEdit={!isNewPost}
          deleteClick={handleDeleteClick}
        />
      </Column>
      {!isNewPost && (
        <DeletePostModal
          post={realtimePost}
          showDelete={showDelete}
          setShowDelete={setShowDelete}
        />
      )}
    </main>
  );
};

export default EditPost;
