import { Container } from "@mui/material";

const DarkContainer = ({ children }: any) => {
  return (
    <Container
      sx={{
        border: "none",
        padding: "0px 10px !important",
        marginTop: "10px",
        width: "fit-content",
      }}
    >
      {children}
    </Container>
  );
};

export default DarkContainer;
