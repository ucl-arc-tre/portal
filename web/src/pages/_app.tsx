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
  // currently a workaround way to load the theme;
  // it can't be imported as a variable for the same reason the components can't be imported (unclear)
  //  but the dynamic method doesn't work for the theme (not a component)
  const [lightTheme, setLightTheme] = useState<ThemeType | undefined>(undefined);

  useEffect(() => {
    async function loadTheme() {
      const { lightTheme } = await import("uikit-react-public/dist/");
      setLightTheme(lightTheme);
    }

    loadTheme();
  }, []);

  return (
    lightTheme && (
      <AuthProvider>
        <MetaHead title="ARC Services Portal | UCL" description="ARC Services Portal" />

        <ThemeContextProvider initialTheme={lightTheme}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ThemeContextProvider>
      </AuthProvider>
    )
  );
}
