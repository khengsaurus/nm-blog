import { IconButton } from "@mui/material";
import { PageRoute } from "enums";
import { AppContext } from "hooks";
import { useContext } from "react";

interface INavButton {
  label: string;
  icon: any;
  path: string | PageRoute;
}

const NavButton = ({ icon, label, path }: INavButton) => {
  const { router, theme, routerPush } = useContext(AppContext);
  const color = router.asPath === path ? theme.highlightColor : theme.mainText;

  return (
    <IconButton
      aria-label={label}
      onClick={() => routerPush(path)}
      style={{ color }}
      disableRipple
    >
      {icon}
    </IconButton>
  );
};

export default NavButton;
