import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import Head from "next/head";
import { fetchRecordByName, LowNoCodeDetail } from "../../utils";

export const getStaticProps: GetStaticProps<
  { record: LowNoCodeDetail },
  { name: string }
> = async ({ params }) => {
  if (!params) {
    return {
      notFound: true,
    };
  }

  const record = await fetchRecordByName(params.name);

  if (!record) {
    return {
      notFound: true,
    };
  }

  return {
    props: { record },
  };
};

const Integration: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  record,
}) => {
  return (
    <>
      <Head>
        <title>{record.name}</title>
        <meta
          name="description"
          content="Low/No Code integrations for NEAR Protocol"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main></main>
    </>
  );
};

export default Integration;
