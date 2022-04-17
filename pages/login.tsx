import { Alert, Collapse, TextField } from "@mui/material";
import { isEmpty } from "lodash";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import HomePage from "../components/HomePage";
import {
  DBService,
  ErrorMessage,
  HttpRequest,
  PageRoute,
  Transition,
} from "../enum";
import { Status } from "../enums";
import { AppContext } from "../hooks";
import { HTTPService } from "../lib/client";
import { StyledButton } from "../styles/StyledMui";
import { AlertStatus, IAlert } from "../types";

const Login = () => {
  const { router, user, setUser, handleUserToken } = useContext(AppContext);
  const [alert, setAlert] = useState<IAlert>(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    if (!!user) {
      router.push(PageRoute.HOME);
    }
  }, [router, user]);

  useEffect(() => {
    setConfirmPassword("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRegister]);

  const loginDisabled = useMemo(
    () => username.trim() === "" || password.trim() === "",
    [username, password]
  );

  const registerDisabled = useMemo(
    () =>
      email.trim() === "" ||
      password.trim() === "" ||
      confirmPassword.trim() === "",
    [email, password, confirmPassword]
  );

  function clearForm() {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  }

  const handleLogin = useCallback(() => {
    HTTPService.makeAuthHttpReq(DBService.USERS, HttpRequest.POST, {
      username,
      password,
      login: true,
    })
      .then((res) => {
        console.log(res);
        if (!isEmpty(res?.data?.token)) {
          handleUserToken(res.data.token);
          setUser(res.data.user);
          setAlert(null);
          clearForm();
          router.push(PageRoute.HOME);
        } else {
          setAlert({ status: Status.ERROR, message: res?.data?.message });
        }
      })
      .catch((err) => console.error(err));
  }, [password, setAlert, setUser, handleUserToken, router, username]);

  const handleRegister = useCallback(() => {
    if (password === confirmPassword) {
      HTTPService.makeAuthHttpReq(DBService.USERS, HttpRequest.POST, {
        email,
        password,
        login: false,
      }).then((res) => {
        if (!isEmpty(res?.data?.token)) {
          handleUserToken(res.data.token);
          setUser(res.data.user);
          setAlert(null);
          clearForm();
          router.push(PageRoute.NEWUSER);
        } else {
          setAlert({ status: Status.ERROR, message: res?.data?.message });
        }
      });
    } else {
      setAlert({ status: Status.ERROR, message: ErrorMessage.PW_NOT_MATCHING });
    }
  }, [
    confirmPassword,
    email,
    password,
    router,
    setAlert,
    setUser,
    handleUserToken,
  ]);

  const renderLoginButton = () => (
    <StyledButton
      label={"Login"}
      type="submit"
      autoFocus
      disabled={loginDisabled}
      onClick={handleLogin}
    />
  );

  const renderRegisterButton = () => (
    <StyledButton
      label={"Register"}
      type="submit"
      autoFocus
      disabled={registerDisabled}
      onClick={handleRegister}
    />
  );

  const markup = (
    <>
      <TextField
        key="usernameEmail"
        label={showRegister ? "Email" : "Username"}
        onChange={(e) =>
          showRegister
            ? setEmail(e.target.value)
            : setUsername(e.target.value?.toLowerCase())
        }
        style={{ width: "160px" }}
        type="text"
        value={showRegister ? email : username}
        variant="standard"
      />
      <TextField
        key="password"
        label={"Password"}
        onChange={(e) => setPassword(e.target.value)}
        style={{ margin: "5px 0", width: "160px" }}
        type="password"
        value={password}
        variant="standard"
      />
      <Collapse in={showRegister} timeout={300} unmountOnExit>
        <TextField
          key="confirmPassword"
          label={"Confirm Password"}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ margin: "5px 0", width: "160px" }}
          type="password"
          value={confirmPassword}
          variant="standard"
        />
      </Collapse>
      <StyledButton
        label={showRegister ? "Back" : "Register"}
        onClick={() => {
          clearForm();
          setShowRegister(!showRegister);
        }}
      />
      {showRegister ? renderRegisterButton() : renderLoginButton()}
      <Collapse
        in={!!alert}
        timeout={{ enter: Transition.FAST, exit: Transition.INSTANT }}
        unmountOnExit
      >
        <Alert severity={alert?.status as AlertStatus}>
          {alert?.message || ErrorMessage.TRY_AGAIN}
        </Alert>
      </Collapse>
    </>
  );

  return <HomePage title={"Login Page"} markup={markup} />;
};

export default Login;
