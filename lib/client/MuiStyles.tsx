import { createTheme, ThemeProvider } from "@mui/material/styles";
import { TransitionSpeed } from "enums";
import { AppContext } from "hooks";
import { useContext, useEffect, useMemo, useState } from "react";
import { ITheme } from "types";
import themes from "./themes";

export const HomeTheme = (props: any) => {
  const { theme } = useContext(AppContext);
  const [muiTheme, setMuiTheme] = useState(newMuiTheme(themes["blue"]));

  useEffect(() => {
    if (theme) setMuiTheme(newMuiTheme(themes[theme]));
  }, [theme]);

  return <ThemeProvider theme={muiTheme} {...props} />;
};

function newMuiTheme(theme: ITheme) {
  const {
    mainBackground,
    componentDark,
    componentLight,
    highlightColor,
    mainText,
  } = theme;

  return createTheme({
    palette: {
      primary: { main: componentDark },
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
            backgroundColor: componentLight,
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
            "&:hover": {
              color: highlightColor,
            },
            "&:disabled": {
              color: "rgb(75, 75, 75) !important",
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
            "&:disabled": {
              color: "rgb(75, 75, 75) !important",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            margin: "6px",
            width: "280px",
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
            border: `2px solid ${componentDark}`,
            padding: "4px 12px",
            backgroundColor: componentDark,
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
            color: mainText,
            backgroundColor: componentDark,
            border: `2px solid ${mainText}`,
            margin: 0,
            padding: 0,
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
            backgroundColor: componentDark,
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
              color: "rgb(75, 75, 75) !important",
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
      MuiPopover: {
        // styleOverrides: {
        //   paper: { backgroundColor },
        // },
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

export const MuiStyles = {
  large_dialog: {
    maxWidth: "500px",
    transition: TransitionSpeed.MEDIUM,
  },
  medium_dialog: {
    minHeight: "80px",
    minWidth: "200px",
    maxWidth: "450px",
    transition: TransitionSpeed.MEDIUM,
  },
  small_dialog: {
    minHeight: "50px",
    minWidth: "200px",
    maxWidth: "350px",
    transition: TransitionSpeed.MEDIUM,
  },
  single_action: {
    justifyContent: "center",
    padding: "0px 8px",
    minHeight: "15px",
  },
  topRight5: {
    position: "absolute",
    top: 5,
    right: 5,
  },
  modal: {
    maxWidth: "385px",
    minWidth: "385px",
    overflow: "scroll",
  },
  tabs: {
    borderRadius: 0,
    maxWidth: "240px",
    height: "32px",
  },
  tabOptions: {
    minWidth: "67px",
    maxWidth: "67px",
    minHeight: "32px",
    maxHeight: "32px",
  },
  tabColorOptions: {
    minWidth: "40px",
    maxWidth: "40px",
    minHeight: "32px",
    maxHeight: "32px",
  },
  icon_button_top_right: {
    position: "absolute",
    top: 5,
    right: 5,
  },
  buttons_small: {
    fontSize: 18,
    fontWeight: 600,
  },
  buttons_medium: {
    fontSize: 20,
    fontWeight: 650,
  },
  buttons_large: {
    fontSize: 26,
    fontWeight: 800,
  },
  small_dropdown_select: {
    width: "52px",
    maxHeight: "28px",
  },
  small_dropdown_item: {
    height: "28px",
    minHeight: "28px",
    maxHeight: "28px",
    margin: "2px",
    justifyContent: "center",
  },
};
