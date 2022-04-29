import { AnimateSharedLayout } from "framer-motion";
import type { AppProps } from "next/app";
import Head from "next/head";
import AppContextProvider from "../hooks/context";
import { HomeTheme } from "../lib/client/MuiStyles";
import "../styles/globals.scss";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppContextProvider>
      <HomeTheme>
        <AnimateSharedLayout>
          <Head>
            <meta
              name="viewport"
              content="initial-scale=1.0, width=device-width"
            />
          </Head>
          <Component {...pageProps} />
        </AnimateSharedLayout>
      </HomeTheme>
    </AppContextProvider>
  );
}

export default MyApp;
