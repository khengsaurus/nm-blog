import type { AppProps } from "next/app";
import { AnimateSharedLayout } from "framer-motion";
import AppContextProvider from "../lib/context";
import "../styles/globals.scss";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppContextProvider>
      <AnimateSharedLayout>
        <Component {...pageProps} />
      </AnimateSharedLayout>
    </AppContextProvider>
  );
}

export default MyApp;
