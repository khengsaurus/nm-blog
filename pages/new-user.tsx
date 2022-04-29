import { Alert, Collapse } from "@mui/material";
import { isEmpty } from "lodash";
import { useContext, useEffect, useState } from "react";
import { HomePage, Input } from "../components";
import {
  APIAction,
  DBService,
  HttpRequest,
  PageRoute,
  PageTitle,
  Transition,
} from "../enums";
import { Status } from "../enums";
import { AppContext } from "../hooks/context";
import { HTTPService } from "../lib/client";
import { StyledButton } from "../styles/StyledMui";
import { AlertStatus, IAlert, IUser } from "../types";

const NewUser = () => {
  const { router, setUser, handleUserToken, user } = useContext(AppContext);
  const [username, setUsername] = useState("");
  const [alert, setAlert] = useState<IAlert>(null);
  // const [toDeleteIfUnload, setToDeleteIfUnload] = useState(true);
  // const checkAuthTimeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (isEmpty(user)) {
      router.push(PageRoute.LOGIN);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, JSON.stringify(user)]);

  // If user ends session before setting username, delete records of email from DB to preserve email availability
  // useEffect(() => {
  //   window.onbeforeunload = () => {
  //     if (toDeleteIfUnload) {
  //       // TODO: clear current user doc
  //     }
  //   };

  //   return () => {
  //     window.onbeforeunload = null;
  //   };
  // }, [toDeleteIfUnload]);

  function cancelRegister() {
    setAlert(null);
    HTTPService.makeAuthHttpReq(DBService.USERS, HttpRequest.DELETE, {
      user,
    });
    router.push(PageRoute.LOGIN);
  }

  function registerUsername(
    email: string,
    username: string,
    user: IUser,
    callback?: () => void
  ) {
    HTTPService.makeAuthHttpReq(DBService.USERS, HttpRequest.PUT, {
      email,
      username,
      action: APIAction.USER_SET_USERNAME,
    }).then((res) => {
      if (res.data?.token) {
        handleUserToken(res.data.token);
        setUser({ ...user, username }); // not returning user obj...
        setAlert({
          status: Status.SUCCESS,
          message: "Successfully registered",
        });
        setTimeout(() => router.push(PageRoute.HOME), 2000);
      } else {
        setAlert({ status: Status.ERROR, message: res.data?.message });
      }
      !!callback && callback();
    });
  }

  const markup = (
    <>
      <Input
        label={"Username"}
        value={username}
        onChange={(e) => setUsername(e.target.value.toLowerCase())}
        style={{ margin: "-5px 0px 5px", width: "150px" }}
        inputProps={{ maxLength: 8 }}
      />
      <div
        className="row"
        style={{ width: "170px", justifyContent: "space-between" }}
      >
        {alert?.status !== Status.SUCCESS && (
          <>
            <StyledButton label="Cancel" onClick={cancelRegister} />
            <StyledButton
              label={"Submit"}
              autoFocus
              type="submit"
              disabled={username.trim() === ""}
              onClick={() => registerUsername(user?.email, username, user)}
            />
          </>
        )}
      </div>
      <Collapse in={!!alert} timeout={Transition.FAST} unmountOnExit>
        <Alert severity={alert?.status as AlertStatus}>{alert?.message}</Alert>
      </Collapse>
    </>
  );

  return <HomePage title={PageTitle.NEW_USER} markup={markup} />;
};

export default NewUser;
