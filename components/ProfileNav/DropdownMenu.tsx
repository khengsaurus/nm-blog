import BoltIcon from "@mui/icons-material/Bolt";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyIcon from "@mui/icons-material/Key";
import LogoutIcon from "@mui/icons-material/Logout";
import PaletteIcon from "@mui/icons-material/Palette";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { StyledButton } from "components";
import { PageRoute } from "enums";
import { AppContext } from "hooks";
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

function renderButton(label: string) {
  return (
    <StyledButton
      label={label}
      style={{
        textTransform: "capitalize",
        fontSize: 15,
        paddingLeft: 0,
      }}
    />
  );
}

const DropdownMenu = forwardRef<MutableRefObject<any>, IDropdownMenu>(
  (props: IDropdownMenu, ref?: MutableRefObject<any>) => {
    const { handleClose } = props;
    const { router, user, logout } = useContext(AppContext);
    const [activeMenu, setActiveMenu] = useState("main");
    const [menuHeight, setMenuHeight] = useState(null);
    const dropdownRef = useRef(null);

    const handleNav = useCallback(
      (route: PageRoute) => {
        router.push(route);
        handleClose();
      },
      [handleClose, router]
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
            <div className="menu">
              <DropdownItem
                leftIcon={<PersonOutlineIcon />}
                callback={() => handleNav(PageRoute.PROFILE)}
              >
                {renderButton("My Profile")}
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
          </CSSTransition>

          <CSSTransition
            in={activeMenu === "theme"}
            classNames="menu-secondary"
            timeout={350}
            onEnter={calcHeight}
            unmountOnExit
          >
            <div className="menu">
              <DropdownItem
                callback={() => setActiveMenu("main")}
                leftIcon={<ChevronLeftIcon />}
              >
                <h5>Themes</h5>
              </DropdownItem>
              <DropdownItem leftIcon={<BoltIcon />}>Default</DropdownItem>
              <DropdownItem leftIcon={<BoltIcon />}>Green</DropdownItem>
              <DropdownItem leftIcon={<BoltIcon />}>White</DropdownItem>
            </div>
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
