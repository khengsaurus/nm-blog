import { CenteredMain, Input, Row, StyledButton } from "components";
import { APIAction, DBService, HttpRequest, PageRoute } from "enums";
import { AppContext } from "hooks/context";
import { HTTPService } from "lib/client";
import { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const NewUser = () => {
  const { user, handleUser, logout, routerPush } = useContext(AppContext);
  const [username, setUsername] = useState("");
  const [toDeleteIfUnload, setToDeleteIfUnload] = useState(true);

  useEffect(() => {
    if (!user) {
      routerPush(PageRoute.LOGIN);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(user), routerPush]);

  const cancelRegister = useCallback(() => {
    setToDeleteIfUnload(false);
    HTTPService.makeAuthHttpReq(DBService.USERS, HttpRequest.DELETE, {
      user,
    })
      .then((res) => {
        if (res.status === 200) {
          logout();
          routerPush(PageRoute.LOGIN);
        } else {
          console.info(res);
        }
      })
      .catch(console.error);
  }, [user, logout, routerPush]);

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
    HTTPService.makeAuthHttpReq(DBService.USERS, HttpRequest.PATCH, {
      email,
      username,
      action: APIAction.USER_SET_USERNAME,
    }).then((res) => {
      if (res.data?.token) {
        setToDeleteIfUnload(false);
        handleUser(res.data.token, res.data.user);
        toast.success("Successfully registered");
        setTimeout(() => routerPush(PageRoute.HOME), 2000);
      } else {
        toast.error(res.data?.message || "Failed to register");
      }
    });
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
