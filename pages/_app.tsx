import { Layout } from "components";
import AppContextProvider from "hooks/context";
import { HomeTheme } from "lib/client/MuiStyles";
import type { AppProps } from "next/app";
import Head from "next/head";
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
          <link rel="prefetch-dns preconnect" href={process.env.ENV_IMG_HOST} />
        </Head>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </HomeTheme>
    </AppContextProvider>
  );
}

export default MyApp;
