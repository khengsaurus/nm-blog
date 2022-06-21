import { createTheme, ThemeProvider } from "@mui/material/styles";
import { DEFAULT_THEME } from "consts";
import { Dimension, TransitionSpeed } from "enums";
import { AppContext } from "hooks";
import { useContext, useEffect, useState } from "react";
import { ITheme } from "types";
import themes from "./themes";

export const HomeTheme = (props: any) => {
  const { theme } = useContext(AppContext);
  const [muiTheme, setMuiTheme] = useState(newMuiTheme(themes[DEFAULT_THEME]));

  useEffect(() => {
    if (theme) setMuiTheme(newMuiTheme(theme));
  }, [theme]);

  return <ThemeProvider theme={muiTheme} {...props} />;
};

function newMuiTheme(theme: ITheme) {
  const { primary, secondary, highlightColor, mainText, mainTextDisabled } =
    theme;

  return createTheme({
    palette: {
      primary: { main: primary },
      secondary: { main: highlightColor },
      text: { primary: mainText },
      action: {
        disabled: "grey",
      },
    },
    typography: {
      body1: { color: mainText },
      body2: { color: mainText },
      h6: {
        fontSize: 18,
        color: mainText,
      },
      subtitle1: { color: mainText },
      subtitle2: { color: mainText },
    },
    components: {
      MuiToolbar: {
        styleOverrides: {
          root: {
            height: 50,
            backgroundColor: secondary,
            alignItems: "center",
            justifyContent: "space-between",
          },
        },
      },
      MuiButtonBase: {
        styleOverrides: {
          root: {
            color: mainText,
            primary: mainText,
            secondary: highlightColor,
            fontSize: 16,
            height: 40,
            "&:hover": {
              color: highlightColor,
            },
            "&:disabled": {
              color: mainTextDisabled,
            },
            "&.MuiCheckbox-root.Mui-checked": {
              color: highlightColor,
            },
            margin: 0,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            color: mainText,
            primary: mainText,
            secondary: highlightColor,
            backgroundColor: "transparent !important",
            fontSize: 16,
            height: 40,
            "&:disabled": {
              color: mainTextDisabled,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: "transparent",
            "&:hover": {
              cursor: "pointer",
            },
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            border: `2px solid ${primary}`,
            padding: "4px 12px",
            backgroundColor: primary,
            "&:last-child": {
              padding: "4px 8px",
            },
            "&:hover": {
              borderColor: highlightColor,
            },
          },
        },
      },
      MuiCardMedia: {
        styleOverrides: {
          root: {
            height: 80,
            objectPosition: "50% 40%",
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: mainText,
            backgroundColor: "transparent !important",
          },
        },
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            backgroundColor: primary,
            border: `2px solid ${mainText}`,
            borderRadius: "4px",
            color: mainText,
            margin: 0,
            padding: "5px !important",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            margin: "18px",
            maxHeight: "calc(100% - 36px)",
            overflow: "hidden",
            overflowX: "hidden",
            overflowY: "hidden",
            userSelect: "none",
            backgroundColor: primary,
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: "0px",
            margin: "0px 5px",
            justifyContent: "space-between",
            minHeight: "15px",
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            padding: "10px 15px 0px 15px",
            userSelect: "none",
            "&:first-of-type": { paddingTop: null },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            margin: "8px 0px",
            borderColor: mainText,
            // '&:first-of-type': { paddingTop: null }
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            backgroundColor: `${secondary} !important`,
            color: mainText,
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: { color: mainText },
        },
      },
      MuiFormControlLabel: {
        styleOverrides: {
          root: {
            margin: "0px",
            "&:hover": {
              color: `${highlightColor} !important`,
              cursor: "normal !important",
            },
          },
          labelPlacementStart: { marginLeft: "0px" },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          colorInherit: { color: mainText },
          root: {
            color: mainText,
            backgroundColor: "transparent !important",
            "&:hover": {
              color: highlightColor,
            },
          },
        },
      },
      MuiInput: {
        styleOverrides: {
          underline: {
            "&&::before": { borderColor: mainText },
            "&&::after": { borderColor: highlightColor },
            "&&:hover::before": { borderColor: highlightColor },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          shrink: {
            "&.MuiInputLabel-animated": { color: mainText },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderColor: mainText,
            fontSize: "16px",
            lineHeight: "23px",
            ".MuiOutlinedInput-notchedOutline": {
              borderColor: mainText,
              borderWidth: "1px",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: highlightColor,
              borderWidth: "2px",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: highlightColor,
              borderWidth: "2px",
            },
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: mainText,
            primary: mainText,
            secondary: highlightColor,
            "&:hover": {
              color: highlightColor,
              cursor: "pointer",
            },
            "&:disabled": {
              color: mainTextDisabled,
            },
            margin: 0,
          },
        },
      },
      MuiList: {
        styleOverrides: {
          padding: {
            paddingTop: "0px",
            paddingBottom: "0px",
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            color: mainText,
            backgroundColor: "transparent !important",
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          root: { color: mainText },
          primary: { color: mainText },
          secondary: { color: mainText },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: mainText,
          },
          body1: {
            fontSize: 16,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            justifyContent: "center",
            backgroundColor: "transparent !important",
            "&:hover": {
              color: highlightColor,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            minWidth: Dimension.CARD_W,
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            color: mainText,
            backgroundColor: "transparent !important",
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          select: {
            textAlign: "center",
            paddingLeft: "12px !important",
            paddingRight: "12px !important",
            backgroundColor: "transparent !important",
            "&:hover": {
              color: highlightColor,
            },
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            color: "inherit",
            // color: mainText,
            // "&:hover": {
            //   color: highlightColor,
            // },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            color: mainText,
            minHeight: "32px !important",
            justifyContent: "baseline",
            fontSize: "1rem",
          },
        },
      },
    },
  });
}

export const avatarStyles = {
  small: { width: Dimension.AVATAR_S, height: Dimension.AVATAR_S },
  medium: { width: Dimension.AVATAR_M, height: Dimension.AVATAR_M },
  large: { width: Dimension.AVATAR_L, height: Dimension.AVATAR_L },
};
