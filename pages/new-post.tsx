import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Column,
  HomePage,
  Input,
  Row,
  StyledButton,
  StyledText,
} from "../components";
import { DBService, HttpRequest, PageTitle } from "../enums";
import { AppContext } from "../hooks";
import { HTTPService } from "../lib/client";
import { checkFileSize, checkFileType, checkOneFileSelected } from "../util";
import { RowGroupEnd } from "../components/StyledComponents";

const NewPost = () => {
  const { user } = useContext(AppContext);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [attachment, setAttachment] = useState<any>(null);
  const hasEditedSlug = useRef(false);

  const saveDisabled = useMemo(
    () => !title.trim() || !slug.trim() || !body.trim(),
    [title, slug, body]
  );

  useEffect(() => {
    if (!hasEditedSlug.current) {
      setSlug(title.toLocaleLowerCase().replaceAll(" ", "-"));
    }
  }, [title]);

  const handleSave = () => {
    if (!!attachment) {
      HTTPService.uploadImage(attachment).then((res) => console.log(res));
    }
    // const createdAt = new Date().toString();
    // HTTPService.makeAuthHttpReq(DBService.POSTS, HttpRequest.POST, {
    //   username: user.username,
    //   title,
    //   slug,
    //   body,
    //   createdAt,
    //   updatedAt: createdAt,
    // }).then((res) => console.log(res));
  };

  function renderAddImageButton() {
    const errHandler = (msg: string) => console.info(msg);

    async function handleAttachment(
      event: React.ChangeEvent<HTMLInputElement>
    ) {
      const file = event.target.files[0];
      if (user?.username && !!file) {
        if (
          checkOneFileSelected(event, errHandler) &&
          checkFileSize(event, errHandler) &&
          checkFileType(event, errHandler)
        ) {
          setAttachment(file);
          // setAttachingImg(true);
          // await HTTPService.uploadAttachment(username, todoId, attachment)
          //   .then((res) => {
          //     if (res?.data) {
          //       updateStateTodo(res.todo, true);
          //       setHasAttachment(true);
          //     } else {
          //       console.info("Error");
          //     }
          //   })
          //   .catch((err) =>
          //     console.info(ErrorMessage.FILE_UPLOAD_FAIL + ": " + err.message)
          //   )
          //   .finally(() => setAttachingImg(false));
        }
      }
    }

    return (
      <IconButton
        component="label"
        style={{ padding: 0, width: 44.5, height: 44.5 }}
        disableRipple
      >
        <AddPhotoAlternateIcon />
        <input type="file" hidden onChange={handleAttachment} />
      </IconButton>
    );
  }

  const markup = (
    <Column>
      <Input
        label={"Title"}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
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
      <Input
        label={"Body"}
        value={body}
        rows={5}
        variant="outlined"
        onChange={(e) => setBody(e.target.value)}
        maxWidth
        marginTop={20}
      />
      <Row>
        {renderAddImageButton()}
        {!!attachment && (
          <RowGroupEnd>
            <StyledText variant="subtitle2" text={attachment.name} />
            <IconButton
              edge="end"
              aria-label="delete-image"
              onClick={() => setAttachment(null)}
            >
              <DeleteIcon />
            </IconButton>
          </RowGroupEnd>
        )}
      </Row>
      <Row>
        <Checkbox
          value={isPrivate}
          onChange={() => setIsPrivate(!isPrivate)}
          disableRipple
        />
        <StyledButton
          label={"Save"}
          disabled={saveDisabled}
          onClick={handleSave}
        />
      </Row>
    </Column>
  );

  return (
    <HomePage
      title={PageTitle.NEW_POST}
      markup={markup}
      requireAuth
      mainClass="left"
    />
  );
};

export default NewPost;
