import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import MetaHead from "@/components/meta/Head";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { ThemeType } from "uikit-react-public";

const ThemeContextProvider = dynamic(() => import("uikit-react-public").then((mod) => mod.ThemeContextProvider), {
  ssr: false,
});

export default function App({ Component, pageProps }: AppProps) {
  const [lightTheme, setLightTheme] = useState<ThemeType | undefined>(undefined);

  useEffect(() => {
    async function loadTheme() {
      const { lightTheme } = await import("uikit-react-public/dist/");
      setLightTheme(lightTheme);
    }

    loadTheme();
  }, []);

  return (
    <AuthProvider>
      <MetaHead title="ARC Services Portal | UCL" description="ARC Services Portal" />

      <ThemeContextProvider initialTheme={lightTheme}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeContextProvider>
    </AuthProvider>
  );
}
