import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import MetaHead from "@/components/meta/Head";
import dynamic from "next/dynamic";

const ThemeContextProvider = dynamic(() => import("uikit-react-public").then((mod) => mod.ThemeContextProvider), {
  ssr: false,
});
export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <MetaHead title="ARC Services Portal | UCL" description="ARC Services Portal" />
      <ThemeContextProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeContextProvider>
    </AuthProvider>
  );
}
