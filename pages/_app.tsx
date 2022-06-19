import { Layout } from "components";
import type { AppProps } from "next/app";
import Head from "next/head";
import AppContextProvider from "hooks/context";
import { HomeTheme } from "lib/client/MuiStyles";
import "../styles/globals.scss";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppContextProvider>
      <HomeTheme>
        <Head>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
          <link
            rel="prefetch-dns preconnect"
            href="https://notes-app-1-sg.s3.ap-southeast-1.amazonaws.com"
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
