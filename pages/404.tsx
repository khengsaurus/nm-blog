import { useNavShortcuts } from "hooks";
import { DarkText } from "../components";

const FourOFour = () => {
  useNavShortcuts();

  return (
    <main className="left pad-top">
      <DarkText text="Whoops!" variant="h2" />
      <br />
      <DarkText text="We are unable to find that page :(" variant="h3" />;
    </main>
  );
};

export default FourOFour;
