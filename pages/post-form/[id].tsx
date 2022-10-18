import Button from "@mui/material/Button";
import {
  Column,
  DeletePostModal,
  DynamicFlex,
  EditPostButtons,
  EditPreviewMarkdown,
  Files,
  ImageForm,
  Input,
  PostCard,
  StyledText,
} from "components";
import { IS_DEV, MAX_POSTS_PER_USER } from "consts";
import {
  APIAction,
  DBService,
  ErrorMessage,
  FileStatus,
  Flag,
  HttpRequest,
  PageRoute,
  Status,
  ToastMessage,
} from "enums";
import {
  AppContext,
  useAsync,
  useFileUploads,
  useOnWindowUnload,
  usePageReady,
  usePreviewImg,
  useRealtimePost,
} from "hooks";
import { deleteFiles, HTTPService } from "lib/client";
import { ServerError } from "lib/server";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Dropzone from "react-dropzone";
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
  const { theme, user, routerPush, updatePostSlugs } = useContext(AppContext);
  const { realtimePost, refreshPost } = useRealtimePost({ id, user }, true);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [hasMarkdown, setHasMarkdown] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const deleteOnUnloadRef = useRef(true);
  const hasEditedSlug = useRef(false);
  const isNewPost = id === "new";
  const isAdmin = user?.isAdmin || IS_DEV;
  const {
    newImg,
    imageKey,
    imgUpdated,
    setNewImg,
    rmImg,
    resetRefs,
    files,
    filesChanged,
    getAddedFileKeys,
    getRemovedFileKeys,
    handleAddFile,
    handleRemoveFile,
    handleDropFiles,
  } = useFileUploads(user, realtimePost);
  usePageReady();
  useOnWindowUnload(() => {
    if (deleteOnUnloadRef.current) {
      deleteFiles(getAddedFileKeys());
    }
  });

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
    if (isNewPost) {
      if (user?.posts?.length >= MAX_POSTS_PER_USER && !isAdmin)
        routerPush(PageRoute.HOME);
    } else {
      const { title, slug, body, isPrivate, hasMarkdown } = realtimePost || {};
      setTitle(title);
      setSlug(slug);
      setBody(body);
      setIsPrivate(isPrivate);
      setHasMarkdown(hasMarkdown);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.posts?.length, isAdmin, isNewPost, realtimePost]);

  const _handlePut = () => {
    return new Promise((resolve, reject) => {
      // If existing post with new slug || new post -> check if slug avail
      if (isNewPost || slug.trim() !== realtimePost?.slug?.trim()) {
        if (!!user?.posts?.find((post) => post.slug === slug)) {
          reject(new Error(ErrorMessage.P_SLUG_USED));
          return;
        }
      }
      const post = {
        id: isNewPost ? "" : realtimePost?.id,
        username: user?.username,
        title,
        slug,
        body,
        imageKey,
        isPrivate,
        hasMarkdown,
        files: files
          .filter((file) => file.key)
          .map((file) => {
            return {
              uploaded: file.uploaded,
              name: file.name,
              key: file.key,
            };
          }),
      };
      HTTPService.makeAuthHttpReq(
        DBService.POSTS,
        isNewPost ? HttpRequest.POST : HttpRequest.PATCH,
        post
      )
        .then((res) => {
          toast.success(
            isNewPost ? ToastMessage.POST_CREATED : ToastMessage.POST_EDITED
          );
          deleteOnUnloadRef.current = false;
          deleteFiles(getRemovedFileKeys());
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
    });
  };

  const _cleanup = useCallback(() => {
    updatePostSlugs(user);
    if (isNewPost) {
      routerPush(PageRoute.MY_POSTS);
    } else {
      refreshPost();
      resetRefs();
      deleteOnUnloadRef.current = true;
    }
  }, [isNewPost, user, refreshPost, resetRefs, routerPush, updatePostSlugs]);

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
      !imgUpdated &&
      !filesChanged);

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setShowDelete(true);
  }

  const showingPreview = usePreviewImg(Flag.PREVIEW_IMG, newImg);

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
        <Dropzone onDrop={handleDropFiles} noClick>
          {({ getRootProps, isDragActive }) => (
            <div
              {...getRootProps()}
              className="file-drop-zone"
              style={{
                borderColor: isDragActive
                  ? theme?.highlightColor
                  : "transparent",
              }}
            >
              <EditPreviewMarkdown
                label="Body"
                body={body}
                markdown={hasMarkdown}
                setBody={setBody}
                style={{ opacity: isDragActive ? 0.2 : 1 }}
              />
              {isDragActive && (
                <StyledText
                  text={"Drop here to upload"}
                  variant="h2"
                  className="label"
                  style={{
                    color:
                      theme.name === "light" ? "black" : theme?.highlightColor,
                  }}
                />
              )}
            </div>
          )}
        </Dropzone>
        <Files files={files} handleRemoveFile={handleRemoveFile} />
        <DynamicFlex>
          <PostCard
            post={{
              slug,
              username: user?.username,
              user,
              title: title || "Preview title",
              body: body || "Preview body",
              createdAt: new Date().toString(),
              imageKey: imageKey || Flag.PREVIEW_IMG,
              hasMarkdown,
            }}
            showingPreview={showingPreview}
            hasAuthorLink={true}
            disable
          />
          <Column style={{ width: "280px" }}>
            <ImageForm
              label="banner image"
              hasImg={!!imageKey || !!newImg}
              setImg={setNewImg}
              rmImg={rmImg}
            />
            <Button disableRipple component="label" className="add-files-label">
              Add file
              <input type="file" hidden onChange={handleAddFile} />
            </Button>
            <EditPostButtons
              isPrivate={isPrivate}
              markdown={hasMarkdown}
              saveButtonLabel={getStatusLabel(saveStatus)}
              saveDisabled={saveDisabled}
              isEdit={!isNewPost}
              togglePrivate={() => setIsPrivate((b) => !b)}
              toggleMarkdown={() => setHasMarkdown((b) => !b)}
              handleSave={handleSave}
              handleCancel={() => deleteFiles(getAddedFileKeys())}
              handleDelete={handleDelete}
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
