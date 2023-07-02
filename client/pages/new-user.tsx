import { CenteredMain, Input, Row, StyledButton } from "components";
import { ApiAction, DbService, HttpRequest, PageRoute } from "enums";
import { usePageReady } from "hooks";
import { AppContext } from "hooks/context";
import { nextHttpService } from "lib/client";
import { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const NewUser = () => {
  const { user, handleUser, logout, routerPush, setPageReady } =
    useContext(AppContext);
  const [username, setUsername] = useState("");
  const [toDeleteIfUnload, setToDeleteIfUnload] = useState(true);
  usePageReady();

  useEffect(() => {
    if (!user) {
      routerPush(PageRoute.LOGIN);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(user), routerPush]);

  const cancelRegister = useCallback(() => {
    setToDeleteIfUnload(false);
    nextHttpService.makeAuthHttpReq(DbService.USERS, HttpRequest.DELETE, {
      user,
    })
      .catch(console.error)
      .finally(() => logout(true));
  }, [user, logout]);

  // If user ends session before setting username, delete records of email from DB to preserve email availability
  useEffect(() => {
    window.onbeforeunload = () => {
      if (toDeleteIfUnload) cancelRegister();
    };

    return () => {
      window.onbeforeunload = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function registerUsername(email: string, username: string) {
    nextHttpService.makeAuthHttpReq(DbService.USERS, HttpRequest.PATCH, {
      email,
      username,
      action: ApiAction.USER_SET_USERNAME,
    })
      .then((res) => {
        if (res.data?.token) {
          setToDeleteIfUnload(false);
          handleUser(res.data.token, res.data.user);
          toast.success("Successfully registered");
          setTimeout(() => routerPush(PageRoute.HOME), 2000);
        } else {
          toast.error(res.data?.message || "Failed to register");
        }
      })
      .finally(() => setPageReady(false));
  }

  return (
    <CenteredMain>
      <Input
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value.toLowerCase())}
        style={{ margin: "-5px 0px 5px", width: "150px" }}
        inputProps={{ maxLength: 8 }}
      />
      <Row style={{ width: "170px" }}>
        <StyledButton label="Cancel" onClick={cancelRegister} />
        <StyledButton
          label="Submit"
          autoFocus
          type="submit"
          disabled={username.trim() === ""}
          onClick={() => registerUsername(user?.email, username)}
        />
      </Row>
    </CenteredMain>
  );
};

export default NewUser;
