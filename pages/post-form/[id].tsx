import {
  Column,
  DeletePostModal,
  DynamicFlex,
  EditPostButtons,
  EditPreviewMarkdown,
  ImageForm,
  Input,
  PostCard,
} from "components";
import {
  DBService,
  ErrorMessage,
  Flag,
  HttpRequest,
  Status,
  ToastMessage,
} from "enums";
import { AppContext, useAsync, usePreviewImg, useRealtimePost } from "hooks";
import { deleteImage, getUploadedImageKey, HTTPService } from "lib/client";
import { ServerError } from "lib/server";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { IResponse } from "types";
import { getStatusLabel } from "utils";

interface IPostPage {
  id: string;
}

export async function getServerSideProps({ params }) {
  const { id } = params;
  return { props: { id } };
}

const EditPost = ({ id }: IPostPage) => {
  const { user, updatePostSlugs } = useContext(AppContext);
  const { realtimePost, refreshPost } = useRealtimePost({ id, user });
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [newImage, setNewImage] = useState<any>(null);
  const [imageKey, setImageKey] = useState("");
  const [hasMarkdown, setHasMarkdown] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const hasEditedSlug = useRef(false);
  const isNewPost = id === "new";
  const imageUpdated = !!newImage || imageKey !== realtimePost?.imageKey;
  const today = useRef(new Date());

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
      const { title, slug, body, imageKey, isPrivate, hasMarkdown } =
        realtimePost || {};
      setTitle(title);
      setSlug(slug);
      setBody(body);
      setImageKey(imageKey);
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
          reject(new Error(ErrorMessage.P_SLUG_USED));
          return;
        }
      }
      let _imageKey = realtimePost?.imageKey;
      let imageError = false;
      if (imageUpdated) {
        // New image -> delete old image if exists. Do not await this.
        if (realtimePost?.imageKey) {
          _imageKey = "";
          deleteImage(realtimePost.imageKey).catch((err) =>
            console.info(err?.message)
          );
        }
        await getUploadedImageKey(newImage)
          .then((key) => (_imageKey = key))
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
          imageKey: _imageKey,
          isPrivate,
          hasMarkdown,
        };
        await HTTPService.makeAuthHttpReq(
          DBService.POSTS,
          isNewPost ? HttpRequest.POST : HttpRequest.PATCH,
          post
        )
          .then((res) => {
            toast.success(
              isNewPost ? ToastMessage.POST_CREATED : ToastMessage.POST_EDITED
            );
            resolve(res);
          })
          .catch((err) => {
            toast.error(
              isNewPost
                ? ToastMessage.POST_CREATED_FAIL
                : ToastMessage.POST_EDITED_FAIL
            );
            reject(err);
          });
      } else {
        toast.error(ToastMessage.I_UPLOAD_FAIL);
      }
    });
  };

  const _cleanup = useCallback(() => {
    if (isNewPost) {
      setTitle("");
      setSlug("");
      setBody("");
      setNewImage(null);
      setImageKey("");
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

  const showingPreview = usePreviewImg(Flag.PREVIEW_IMG, newImage);

  return (
    <main className="left pad-top-small">
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
        <br />
        <DynamicFlex>
          <PostCard
            post={{
              slug,
              username: user?.username,
              user,
              title: title || "Preview title",
              body: body || "Preview body",
              updatedAt: today.current?.toString(),
              imageKey: imageKey || Flag.PREVIEW_IMG,
              hasMarkdown,
            }}
            showingPreview={showingPreview}
            hasAuthorLink={true}
            disable
          />
          <Column style={{ width: "280px" }}>
            <ImageForm
              label="banner"
              hasImage={!!imageKey || !!newImage}
              setImage={setNewImage}
              setImageKey={setImageKey}
            />
            <EditPostButtons
              isPrivate={isPrivate}
              setIsPrivate={setIsPrivate}
              hasMarkdown={hasMarkdown}
              setHasMarkdown={setHasMarkdown}
              saveButtonLabel={getStatusLabel(saveStatus)}
              saveDisabled={saveDisabled}
              handleSave={handleSave}
              isEdit={!isNewPost}
              deleteClick={handleDeleteClick}
            />
          </Column>
        </DynamicFlex>
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
