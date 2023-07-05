import { Collapse } from "@mui/material";
import { CenteredMain, Input, Row, StyledButton } from "components";
import {
  ApiAction,
  DbService,
  HttpRequest,
  PageRoute,
  ToastMessage,
} from "enums";
import {
  AppContext,
  useFirstEffect,
  useKeyListener,
  usePageReady,
} from "hooks";
import { nextHttpService } from "lib/client";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { IResponse } from "types";

const Login = () => {
  const { user, handleUser, routerPush } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  usePageReady();

  useFirstEffect(() => {
    if (user) {
      routerPush(PageRoute.HOME);
    }
  }, [routerPush, user]);

  useEffect(() => setConfirmPassword(""), [showRegister]);

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

  const resetFrom = useCallback(() => {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  }, []);

  const cleanup = useCallback(
    (res: IResponse, route: PageRoute) => {
      routerPush(route);
      Promise.resolve().then(() => handleUser(res.data.token, res.data.user));
    },
    [handleUser, routerPush]
  );

  const handleLogin = useCallback(() => {
    nextHttpService
      .makeAuthHttpReq(DbService.USERS, HttpRequest.POST, {
        username,
        password,
        action: ApiAction.LOGIN,
      })
      .then((res) => {
        if (res.status === 200 && res?.data?.token) {
          cleanup(res, PageRoute.HOME);
        } else {
          toast.error(res?.data?.message);
        }
      })
      .catch(console.error);
  }, [cleanup, username, password]);

  const handleRegister = useCallback(() => {
    if (password === confirmPassword) {
      nextHttpService
        .makeAuthHttpReq(DbService.USERS, HttpRequest.POST, {
          email,
          password,
          action: ApiAction.REGISTER,
        })
        .then((res) => {
          if (res?.data?.token) {
            cleanup(res, PageRoute.NEW_USER);
          } else {
            toast.error(res?.data?.message);
          }
        });
    } else {
      toast.error(ToastMessage.PW_NOT_MATCHING);
    }
  }, [confirmPassword, email, password, cleanup]);

  useKeyListener(
    "Enter",
    useCallback(() => {
      (showRegister ? handleRegister : handleLogin)();
    }, [showRegister, handleLogin, handleRegister]),
    true
  );

  return (
    <CenteredMain>
      <Input
        label={showRegister ? "Email" : "Username"}
        value={showRegister ? email : username}
        onChange={(e) =>
          showRegister
            ? setEmail(e.target.value)
            : setUsername(e.target.value?.toLowerCase())
        }
      />
      <Input
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        password
      />
      <Collapse in={showRegister} timeout={300} unmountOnExit>
        <Input
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          password
        />
      </Collapse>
      <Row style={{ width: 180 }}>
        <StyledButton
          label={showRegister ? "Back" : "Register"}
          onClick={() => {
            resetFrom();
            setShowRegister((p) => !p);
          }}
        />
        {showRegister ? (
          <StyledButton
            label="Register"
            type="submit"
            autoFocus
            disabled={registerDisabled}
            onClick={handleRegister}
          />
        ) : (
          <StyledButton
            label="Login"
            type="submit"
            autoFocus
            disabled={loginDisabled}
            onClick={handleLogin}
          />
        )}
      </Row>
    </CenteredMain>
  );
};

export default Login;
