import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DoneIcon from "@mui/icons-material/Done";
import KeyIcon from "@mui/icons-material/Key";
import LogoutIcon from "@mui/icons-material/Logout";
import PaletteIcon from "@mui/icons-material/Palette";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { Fade } from "@mui/material";
import { Container } from "@mui/system";
import { NavMenuButton } from "components";
import { PageRoute } from "enums";
import { AppContext } from "hooks";
import { themes } from "lib/client";
import {
  forwardRef,
  MutableRefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { CSSTransition } from "react-transition-group";
import DropdownItem from "./DropdownItem";

interface IDropdownMenu {
  open: boolean;
  handleClose: () => void;
}

function getHeight(items: number) {
  return 57 * items + 14;
}

const DropdownMenu = forwardRef<MutableRefObject<any>, IDropdownMenu>(
  (props: IDropdownMenu, ref?: MutableRefObject<any>) => {
    const { open, handleClose } = props;
    const { theme, user, logout, routerPush, setThemeName } =
      useContext(AppContext);
    const [activeMenu, setActiveMenu] = useState("main");
    const [menuHeight, setMenuHeight] = useState(0);
    const dropdownRef = useRef(null);

    const setDefaultMenuHeight = useCallback(() => {
      setMenuHeight((user ? 3 : 2) * 57 + 14);
    }, [user]);

    useEffect(() => setDefaultMenuHeight(), [setDefaultMenuHeight, user]);

    const handleNav = useCallback(
      (route: PageRoute) => {
        routerPush(route);
        handleClose();
      },
      [handleClose, routerPush]
    );

    const handleLogout = useCallback(() => {
      logout();
      handleClose();
    }, [handleClose, logout]);

    function renderMainMenu() {
      return (
        <div className="menu">
          {user && (
            <DropdownItem
              leftIcon={<PersonOutlineIcon />}
              rightIcon={<ChevronRightIcon />}
              callback={() => setActiveMenu("profile")}
            >
              {<NavMenuButton label="Profile" />}
            </DropdownItem>
          )}
          <DropdownItem
            leftIcon={<PaletteIcon />}
            rightIcon={<ChevronRightIcon />}
            callback={() => setActiveMenu("theme")}
          >
            {<NavMenuButton label="Theme" />}
          </DropdownItem>
          {user ? (
            <DropdownItem leftIcon={<LogoutIcon />} callback={handleLogout}>
              {<NavMenuButton label="Logout" />}
            </DropdownItem>
          ) : (
            <DropdownItem
              leftIcon={<KeyIcon />}
              callback={() => handleNav(PageRoute.LOGIN)}
            >
              {<NavMenuButton label="Login" />}
            </DropdownItem>
          )}
        </div>
      );
    }

    function renderProfileMenu() {
      return (
        <div className="menu">
          <DropdownItem callback={() => setActiveMenu("main")} hasBack>
            {<NavMenuButton label="Profile" fontSize={18} />}
          </DropdownItem>
          <DropdownItem
            leftIcon={<PersonOutlineIcon />}
            callback={() => handleNav(PageRoute.MY_PROFILE)}
          >
            {<NavMenuButton label="Details" />}
          </DropdownItem>
        </div>
      );
    }

    function renderThemeMenu() {
      return (
        <div className="menu">
          <DropdownItem callback={() => setActiveMenu("main")} hasBack>
            {<NavMenuButton label="Themes" fontSize={18} />}
          </DropdownItem>
          {Object.keys(themes).map((name) => (
            <DropdownItem
              key={name}
              leftIcon={themes[name].icon}
              rightIcon={
                name === theme.name && (
                  <DoneIcon style={{ color: theme.highlightColor }} />
                )
              }
              callback={() => setThemeName(name)}
            >
              <NavMenuButton label={name} />
            </DropdownItem>
          ))}
        </div>
      );
    }

    function renderMenu() {
      return (
        <div ref={ref}>
          <CSSTransition
            in={activeMenu === "main"}
            classNames="menu-primary"
            timeout={350}
            onEnter={setDefaultMenuHeight}
            unmountOnExit
          >
            {renderMainMenu()}
          </CSSTransition>

          <CSSTransition
            in={activeMenu === "profile"}
            classNames="menu-secondary"
            timeout={350}
            onEnter={() => setMenuHeight(getHeight(2))}
            unmountOnExit
          >
            {renderProfileMenu()}
          </CSSTransition>

          <CSSTransition
            in={activeMenu === "theme"}
            classNames="menu-secondary"
            timeout={350}
            onEnter={() =>
              setMenuHeight(getHeight(Object.keys(themes).length + 1))
            }
            unmountOnExit
          >
            {renderThemeMenu()}
          </CSSTransition>
        </div>
      );
    }

    return (
      <Fade
        in={open}
        unmountOnExit
        onExit={() =>
          setTimeout(() => {
            setDefaultMenuHeight();
            setActiveMenu("main");
          }, 500)
        }
      >
        <Container
          className="dropdown"
          style={{ height: menuHeight, width: "214px", padding: 0 }}
          ref={dropdownRef}
        >
          {renderMenu()}
        </Container>
      </Fade>
    );
  }
);

DropdownMenu.displayName = "DropdownMenu";

export default DropdownMenu;
