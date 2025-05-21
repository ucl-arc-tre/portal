import Head from "next/head";

type HeadProps = {
  title: string;
  description: string;
};

export default function MetaHead(props: HeadProps) {
  return (
    <Head>
      <title>{props.title}</title>
      <meta property="description" content={props.description} key="description" />
    </Head>
  );
}
