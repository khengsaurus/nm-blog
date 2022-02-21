import { Alert, Collapse, TextField } from "@mui/material";
import axios from "axios";
import { isEmpty } from "lodash";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import HomePage from "../components/HomePage";
import {
  DBService,
  ErrorMessage,
  HttpRequestType,
  PageRoute,
  Transition,
} from "../enum";
import { Status } from "../enums";
import { AppContext } from "../lib/context";
import { StyledButton } from "../styles/StyledMui";
import { AlertStatus } from "../types";

const Login = () => {
  const { alert, makeAuthHttpReq, router, setAlert, setUser, setUserToken } =
    useContext(AppContext);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRegister, setShowRegister] = useState(false);

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
    axios
      .post(`api/user`, {
        username,
        password,
        login: true,
      })
      .then((res) => {
        if (!isEmpty(res?.data?.token)) {
          setUserToken(res.data.token);
          setUser(res.data.user);
          setAlert(null);
          clearForm();
          //TODO: push to home page
        } else {
          setAlert({ status: Status.ERROR, message: res?.data?.message });
        }
      })
      .catch((err) => console.error(err));
  }, [password, setAlert, setUser, setUserToken, username]);

  const handleRegister = useCallback(() => {
    if (password === confirmPassword) {
      makeAuthHttpReq(DBService.USER, HttpRequestType.POST, {
        email,
        password,
        login: false,
      }).then((res) => {
        if (!isEmpty(res?.data?.token)) {
          setUserToken(res.data.token);
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
    makeAuthHttpReq,
    password,
    router,
    setAlert,
    setUser,
    setUserToken,
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
