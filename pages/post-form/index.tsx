import {
  AttachmentForm,
  CircleLoader,
  Column,
  EditPreviewMarkdown,
  EditPostButtons,
  Input
} from "components";
import { DBService, ErrorMessage, HttpRequest, Status } from "enums";
import { AppContext, useAsync } from "hooks";
import { HTTPService } from "lib/client";
import { ServerError } from "lib/server";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { IResponse } from "types";

const NewPost = () => {
  const { user } = useContext(AppContext);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [attachment, setAttachment] = useState<any>(null);
  const [hasMarkdown, setHasMarkdown] = useState(false);
  const hasEditedSlug = useRef(false);

  useEffect(() => {
    if (!hasEditedSlug.current) {
      setSlug(title.toLocaleLowerCase().replaceAll(" ", "-"));
    }
  }, [title]);

  const _handleSave = useCallback(() => {
    let noImageUploadError = true;
    return new Promise(async (resolve, reject) => {
      if (!!user.posts?.find((post) => post.slug === slug)) {
        reject(new Error(ErrorMessage.POST_SLUG_USED));
        return;
      }
      let imageKey = "";
      if (!!attachment) {
        await HTTPService.uploadImage(attachment)
          .then((res) => {
            if (res.status === 200 && res.data?.key) {
              imageKey = res.data.key;
            } else {
              reject(new Error(ErrorMessage.FILE_UPLOAD_FAIL));
            }
          })
          .catch((err) => {
            noImageUploadError = false;
            reject(err);
          });
      }
      if (noImageUploadError) {
        HTTPService.makeAuthHttpReq(DBService.POSTS, HttpRequest.POST, {
          username: user.username,
          title,
          slug,
          body,
          imageKey,
          isPrivate,
          hasMarkdown,
          imageName: attachment?.name || "",
        })
          .then((res) => resolve(res))
          .catch((err) => reject(err));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachment, body, slug, title, JSON.stringify(user)]);

  const _cleanup = useCallback(() => {
    setTitle("");
    setSlug("");
    setBody("");
    setAttachment(null);
  }, []);

  const { execute: handleSave, status: saveStatus } = useAsync<
    IResponse,
    ServerError
  >(_handleSave, _cleanup, (r: IResponse) => r.status === 200, false);

  const saveDisabled = useMemo(
    () =>
      !title.trim() ||
      !slug.trim() ||
      !body.trim() ||
      saveStatus !== Status.IDLE,
    [title, slug, body, saveStatus]
  );

  const saveButtonLabel: any = useMemo(() => {
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
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          inputProps={{ maxLength: 50 }}
          maxWidth
        />
        <Input
          label="Slug"
          value={slug}
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
        <AttachmentForm attachment={attachment} setAttachment={setAttachment}/>
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

export default NewPost;
