import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
import KeyIcon from "@mui/icons-material/Key";
import LogoutIcon from "@mui/icons-material/Logout";
import PaletteIcon from "@mui/icons-material/Palette";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Fade from "@mui/material/Fade";
import { Container } from "@mui/system";
import { renderButton } from "components/utils";
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

const themeMenuHeight = 57 * (Object.keys(themes).length + 1) + 8;

const DropdownMenu = forwardRef<MutableRefObject<any>, IDropdownMenu>(
  (props: IDropdownMenu, ref?: MutableRefObject<any>) => {
    const { open, handleClose } = props;
    const { user, logout, routerPush, setTheme } = useContext(AppContext);
    const [activeMenu, setActiveMenu] = useState("main");
    const [menuHeight, setMenuHeight] = useState(0);
    const dropdownRef = useRef(null);

    const setDefaultMenuHeight = useCallback(() => {
      setMenuHeight((user ? 3 : 2) * 57 + 8);
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
              {renderButton("Profile")}
            </DropdownItem>
          )}
          <DropdownItem
            leftIcon={<PaletteIcon />}
            rightIcon={<ChevronRightIcon />}
            callback={() => setActiveMenu("theme")}
          >
            {renderButton("Theme")}
          </DropdownItem>
          {user ? (
            <DropdownItem leftIcon={<LogoutIcon />} callback={handleLogout}>
              {renderButton("Logout")}
            </DropdownItem>
          ) : (
            <DropdownItem
              leftIcon={<KeyIcon />}
              callback={() => handleNav(PageRoute.LOGIN)}
            >
              {renderButton("Login")}
            </DropdownItem>
          )}
        </div>
      );
    }

    function renderProfileMenu() {
      return (
        <div className="menu">
          <DropdownItem callback={() => setActiveMenu("main")} hasBack>
            {renderButton("Profile", 18)}
          </DropdownItem>
          <DropdownItem
            leftIcon={<DynamicFeedIcon />}
            callback={() => handleNav(PageRoute.MY_POSTS)}
          >
            {renderButton("Posts")}
          </DropdownItem>
          <DropdownItem
            leftIcon={<PersonOutlineIcon />}
            callback={() => handleNav(PageRoute.MY_PROFILE)}
          >
            {renderButton("Details")}
          </DropdownItem>
        </div>
      );
    }

    function renderThemeMenu() {
      return (
        <div className="menu">
          <DropdownItem callback={() => setActiveMenu("main")} hasBack>
            {renderButton("Themes", 18)}
          </DropdownItem>
          {Object.keys(themes).map((opt) => (
            <DropdownItem
              key={opt}
              leftIcon={themes[opt].icon}
              callback={() => setTheme(opt)}
            >
              {renderButton(opt)}
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
            // fn calcHeight(el) => setMenuHeight(el.offsetHeight + 8)
            unmountOnExit
          >
            {renderMainMenu()}
          </CSSTransition>

          <CSSTransition
            in={activeMenu === "profile"}
            classNames="menu-secondary"
            timeout={350}
            onEnter={setDefaultMenuHeight}
            unmountOnExit
          >
            {renderProfileMenu()}
          </CSSTransition>

          <CSSTransition
            in={activeMenu === "theme"}
            classNames="menu-secondary"
            timeout={350}
            onEnter={() => setMenuHeight(themeMenuHeight)}
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
        onExit={() => setTimeout(() => setActiveMenu("main"), 500)}
      >
        <Container
          className="dropdown"
          style={{ height: menuHeight, width: "258px", padding: 2 }}
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
