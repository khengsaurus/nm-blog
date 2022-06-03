import {
  AttachmentForm,
  CircleLoader,
  Column,
  EditPreviewMarkdown,
  EditPostButtons,
  Input,
} from "components";
import { Status } from "enums";
import { AppContext, useAsync, useRealtimePost } from "hooks";
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
  const post = useRealtimePost({ id, user });
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [attachment, setAttachment] = useState<any>(null);
  const [hasMarkdown, setHasMarkdown] = useState(false);
  const hasEditedSlug = useRef(false);

  useEffect(() => {
    const { title, slug, body, isPrivate, hasMarkdown } = post;
    setTitle(title);
    setSlug(slug);
    setBody(body);
    setIsPrivate(isPrivate);
    setHasMarkdown(hasMarkdown);
  }, [post]);

  const _handleSave = useCallback(() => {
    /**
     * Image changes:
     * Delete old image
     * Update new image
     */
    /**
     * Post changes:
     * Patch doc
     */
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachment, body, slug, title, JSON.stringify(user)]);

  const { execute: handleSave, status: saveStatus } = useAsync<
    IResponse,
    ServerError
  >(_handleSave, null, (r: IResponse) => r.status === 200, false);

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
        <AttachmentForm
          attachment={attachment}
          setAttachment={setAttachment}
          imageName={post?.imageName}
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
