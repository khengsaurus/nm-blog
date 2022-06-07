import BoltIcon from "@mui/icons-material/Bolt";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
import KeyIcon from "@mui/icons-material/Key";
import LogoutIcon from "@mui/icons-material/Logout";
import PaletteIcon from "@mui/icons-material/Palette";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
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
  handleClose: () => void;
}

const DropdownMenu = forwardRef<MutableRefObject<any>, IDropdownMenu>(
  (props: IDropdownMenu, ref?: MutableRefObject<any>) => {
    const { handleClose } = props;
    const { user, logout, routerPush, setTheme } = useContext(AppContext);
    const [activeMenu, setActiveMenu] = useState("main");
    const [menuHeight, setMenuHeight] = useState(null);
    const dropdownRef = useRef(null);

    const handleNav = useCallback(
      (route: PageRoute) => {
        routerPush(route);
        handleClose();
      },
      [handleClose, routerPush]
    );

    useEffect(() => {
      setMenuHeight(dropdownRef.current?.firstChild.offsetHeight);
    }, []);

    function calcHeight(el) {
      const height = el.offsetHeight;
      setMenuHeight(height);
    }

    const handleLogout = useCallback(() => {
      logout();
      handleClose();
    }, [handleClose, logout]);

    function renderMainMenu() {
      return (
        <div className="menu">
          <DropdownItem
            leftIcon={<PersonOutlineIcon />}
            rightIcon={<ChevronRightIcon />}
            callback={() => setActiveMenu("profile")}
          >
            {renderButton("Profile")}
          </DropdownItem>
          <DropdownItem
            leftIcon={<PaletteIcon />}
            rightIcon={<ChevronRightIcon />}
            callback={() => setActiveMenu("theme")}
          >
            {renderButton("Theme")}
          </DropdownItem>
          <DropdownItem leftIcon={<LogoutIcon />} callback={handleLogout}>
            {renderButton("Logout")}
          </DropdownItem>
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
              leftIcon={<BoltIcon />}
              callback={() => setTheme(opt)}
            >
              {renderButton(opt)}
            </DropdownItem>
          ))}
        </div>
      );
    }

    function renderLoggedInMenu() {
      return (
        <div ref={ref}>
          <CSSTransition
            in={activeMenu === "main"}
            classNames="menu-primary"
            timeout={350}
            onEnter={calcHeight}
            unmountOnExit
          >
            {renderMainMenu()}
          </CSSTransition>

          <CSSTransition
            in={activeMenu === "profile"}
            classNames="menu-secondary"
            timeout={350}
            onEnter={calcHeight}
            unmountOnExit
          >
            {renderProfileMenu()}
          </CSSTransition>

          <CSSTransition
            in={activeMenu === "theme"}
            classNames="menu-secondary"
            timeout={350}
            onEnter={calcHeight}
            unmountOnExit
          >
            {renderThemeMenu()}
          </CSSTransition>
        </div>
      );
    }

    function renderNotLoggedInMenu() {
      return (
        <div className="menu" ref={ref}>
          <DropdownItem
            leftIcon={<KeyIcon />}
            callback={() => handleNav(PageRoute.LOGIN)}
          >
            {renderButton("Login")}
          </DropdownItem>
        </div>
      );
    }

    return (
      <div
        className="dropdown"
        style={{ height: menuHeight }}
        ref={dropdownRef}
      >
        {!!user ? renderLoggedInMenu() : renderNotLoggedInMenu()}
      </div>
    );
  }
);

DropdownMenu.displayName = "DropdownMenu";

export default DropdownMenu;
