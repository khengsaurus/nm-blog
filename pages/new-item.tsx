import React, { useContext, useMemo, useState } from "react";
import { HomePage, Input, RowReversed, StyledButton } from "../components";
import { PageTitle } from "../enums";
import { AppContext } from "../hooks";

const NewItem = () => {
  const { user } = useContext(AppContext);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const saveDisabled = useMemo(
    () => !title.trim() || !body.trim(),
    [title, body]
  );

  const markup = (
    <main className="left">
      <Input
        label={"Title"}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
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
      <RowReversed>
        <StyledButton label={"Save"} disabled={saveDisabled} />
      </RowReversed>
    </main>
  );

  return <HomePage title={PageTitle.NEW_ITEM} markup={markup} requireAuth />;
};

export default NewItem;
