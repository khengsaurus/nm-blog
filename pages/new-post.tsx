import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import { ServerError } from "lib/server";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { IResponse } from "types";
import {
  CircleLoader,
  Column,
  Input,
  MarkdownEditor,
  MarkdownViewer,
  Row,
  StyledButton,
  StyledText,
} from "../components";
import { DBService, ErrorMessage, HttpRequest, Status } from "../enums";
import {
  AppContext,
  useAsync,
  useDocumentListener,
  useWindowListener,
} from "../hooks";
import { HTTPService } from "../lib/client";
import { checkFileSize, checkFileType, checkOneFileSelected } from "../utils";

const NewPost = () => {
  const { user } = useContext(AppContext);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [attachment, setAttachment] = useState<any>(null);
  const [hasMarkdown, setHasMarkdown] = useState(false);
  const editorRef = useRef(null);
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

  function renderEditAndPreview() {
    return (
      <Row style={{ alignItems: "flex-start" }}>
        <MarkdownEditor
          value={body}
          setValue={setBody}
          fullWidth={!hasMarkdown}
          ref={editorRef}
        />
        <MarkdownViewer
          text={hasMarkdown ? body : ""}
          hasMarkdown={hasMarkdown}
          height={editorRef?.current?.clientHeight}
        />
      </Row>
    );
  }

  function renderAttachment() {
    const errHandler = (msg: string) => console.info(msg);

    async function handleAttachment(
      event: React.ChangeEvent<HTMLInputElement>
    ) {
      if (
        checkOneFileSelected(event, errHandler) &&
        checkFileSize(event, errHandler) &&
        checkFileType(event, errHandler)
      ) {
        setAttachment(event.target.files[0]);
      }
    }

    return (
      <Row>
        <Button
          disableRipple
          component="label"
          style={{
            height: "40px",
            width: "120px",
            padding: "0px",
            justifyContent: "flex-start",
            textTransform: "capitalize",
            marginLeft: 10,
          }}
        >
          Add image
          <input type="file" hidden onChange={handleAttachment} />
        </Button>
        {!!attachment && (
          <Row style={{ justifyContent: "flex-end" }}>
            <StyledText variant="body1" text={attachment.name} />
            <IconButton
              edge="end"
              aria-label="delete-image"
              onClick={() => setAttachment(null)}
            >
              <DeleteIcon />
            </IconButton>
          </Row>
        )}
      </Row>
    );
  }

  function renderButtons() {
    return (
      <>
        <Row style={{ justifyContent: "flex-start" }}>
          <Checkbox
            value={isPrivate}
            onChange={() => setIsPrivate(!isPrivate)}
            disableRipple
          />
          <StyledText text="Private post" variant="body1" />
        </Row>
        <div className="justify-start-last-end">
          <Checkbox
            value={hasMarkdown}
            onChange={() => setHasMarkdown(!hasMarkdown)}
            disableRipple
          />
          <StyledText text="Has markdown" variant="body1" />
          <StyledButton
            label={saveButtonLabel}
            disabled={saveDisabled}
            onClick={handleSave}
            style={{ marginRight: -10 }}
          />
        </div>
      </>
    );
  }

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
          label={"Title"}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          inputProps={{ maxLength: 50 }}
          maxWidth
        />
        <Input
          label={"Slug"}
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
        {renderEditAndPreview()}
        {renderAttachment()}
        {renderButtons()}
      </Column>
    </main>
  );
};

export default NewPost;
