import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useContext, useMemo } from "react";
import { TransitionSpeed } from "../../enums";
import { AppContext } from "../../hooks";

export const HomeTheme = (props: any) => {
  const { darkMode } = useContext(AppContext);
  const _theme = useMemo(() => {
    return newMuiTheme(darkMode);
  }, [darkMode]);

  return <ThemeProvider theme={_theme} {...props} />;
};

const grey = "rgb(66, 80, 107)";
const blue = "rgb(62, 97, 155)";
const red = "rgb(239, 75, 76)";
const white = "rgb(230, 230, 230)";

function newMuiTheme(darkMode: boolean) {
  const backgroundColor = darkMode ? grey : grey;
  const componentHighlight = darkMode ? blue : blue;
  const mainText = darkMode ? white : white;
  const highlightColor = darkMode ? red : red;
  const accordionWidth = {
    minWidth: "200px",
    width: "80vw",
    maxWidth: "450px",
  };

  return createTheme({
    palette: {
      primary: { main: backgroundColor },
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
      MuiAccordion: {
        styleOverrides: {
          root: {
            backgroundColor,
            boxShadow: "none",
            ...accordionWidth,
            "&:before": { content: "none" },
            "&.Mui-expanded": {
              margin: "0px",
            },
          },
        },
      },
      MuiAccordionDetails: {
        styleOverrides: {
          root: {
            backgroundColor,
            padding: 2,
            overflowX: "hidden",
            overflowY: "scroll",
            ...accordionWidth,
            // borderTop: `1px solid ${highlightColor}`,
            // borderBottom: `1px solid ${highlightColor}`
          },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            backgroundColor,
            boxShadow: "none",
            color: mainText,
            minHeight: "40px",
            ...accordionWidth,
            padding: 0,
            "&.Mui-expanded": {
              minHeight: "40px",
            },
          },
          content: {
            margin: `4px 0px`,
            "&.Mui-expanded": {
              margin: `4px 0px !important`,
            },
          },
          expandIconWrapper: {
            color: mainText,
            transition: TransitionSpeed.MEDIUM,
            "&:hover": {
              color: highlightColor,
            },
            "&.Mui-expanded": {
              color: highlightColor,
              transform: "rotate(90deg)",
            },
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            height: 50,
            backgroundColor: componentHighlight,
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
            border: `2px solid ${grey}`,
            padding: "4px 12px",
            backgroundColor: grey,
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
      MuiDialog: {
        styleOverrides: {
          paper: {
            margin: "18px",
            maxHeight: "calc(100% - 36px)",
            overflow: "hidden",
            overflowX: "hidden",
            overflowY: "hidden",
            userSelect: "none",
            backgroundColor,
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: "0px",
            marginTop: "-4px",
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
            borderColor: white,
            ".MuiOutlinedInput-notchedOutline": {
              borderColor: white,
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
            color: mainText,
            "&:hover": {
              color: highlightColor,
            },
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
