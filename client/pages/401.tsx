import { useNavShortcuts } from "hooks";
import { DarkText } from "../components";

const FourOOne = () => {
  useNavShortcuts();

  return (
    <main className="left pad-top">
      <DarkText text="Whoops!" variant="h2" />
      <br />
      <DarkText
        text="Are you sure you're allowed to see this? 🫣"
        variant="h3"
      />
    </main>
  );
};

export default FourOOne;
