import { Layout } from "components";
import type { AppProps } from "next/app";
import Head from "next/head";
import AppContextProvider from "../hooks/context";
import { HomeTheme } from "../lib/client/MuiStyles";
import "../styles/globals.scss";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppContextProvider>
      <HomeTheme>
        {/* @ts-ignore */}
        <Head>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
        </Head>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </HomeTheme>
    </AppContextProvider>
  );
}

export default MyApp;
