import Checkbox from "@mui/material/Checkbox";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { HomePage, Input, Row, StyledButton } from "../components";
import { DBService, HttpRequest, PageTitle } from "../enums";
import { AppContext } from "../hooks";
import { HTTPService } from "../lib/client";

const NewItem = () => {
  const { user } = useContext(AppContext);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
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

  const handleSave = useCallback(() => {
    HTTPService.makeAuthHttpReq(DBService.POSTS, HttpRequest.POST, {
      title,
      slug,
      body,
    }).then((res) => console.log(res));
  }, [title, slug, body]);

  const markup = (
    <main className="left">
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
        onClick={(e) => (hasEditedSlug.current = true)}
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
    </main>
  );

  return <HomePage title={PageTitle.NEW_ITEM} markup={markup} requireAuth />;
};

export default NewItem;
