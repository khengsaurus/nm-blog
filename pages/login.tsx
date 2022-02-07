import { Collapse, TextField } from "@mui/material";
import axios from "axios";
import { isEmpty } from "lodash";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import HomePage from "../components/HomePage";
import { AppContext } from "../lib/context";
import { StyledButton } from "../styles/StyledMui";

const Login = () => {
  const { setUser, setUsername } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [username, setUsername_] = useState("");
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
    setUsername_("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  }

  const handleLogin = useCallback(() => {
    axios
      .get("http://localhost:3000/api/user", { params: { username } })
      .then((doc) => {
        if (!isEmpty(doc?.data) && password === doc.data.password) {
          console.log("Logging in");
          setUser(doc.data);
          setUsername(doc.data.username);
        } else {
          console.log("Check credentials");
        }
      });
  }, [setUser, setUsername, username, password]);

  const handleRegister = useCallback(() => {}, []);

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
    <div className="column">
      <TextField
        key="usernameEmail"
        label={showRegister ? "Email" : "Username"}
        onChange={(e) =>
          showRegister
            ? setEmail(e.target.value)
            : setUsername_(e.target.value?.toLowerCase())
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
    </div>
  );

  return <HomePage title={"Login Page"} markup={markup} />;
};

export default Login;
