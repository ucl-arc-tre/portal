import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import MetaHead from "@/components/meta/Head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <MetaHead title="ARC Services Portal | UCL" description="ARC Services Portal" />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}
