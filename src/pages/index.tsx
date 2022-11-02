import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import Head from "next/head";
import Image from "next/future/image";
import { fetchAllRecords, LowNoCodeEntry } from "../utils";
import clsx from "clsx";

export const getStaticProps: GetStaticProps<{
  records: Array<LowNoCodeEntry>;
}> = async () => {
  const records = await fetchAllRecords();

  return {
    props: {
      records,
    },
  };
};

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  records,
}) => {
  return (
    <>
      <Head>
        <title>Low/No code integrations for NEAR</title>
      </Head>

      <main className="h-screen overflow-y-scroll bg-gradient-to-br from-blue-100 via-white to-white text-gray-600">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center py-8">
          <h1 className="my-10 text-5xl font-bold">
            Low/No code integrations for NEAR
          </h1>

          <section className="flex h-[50vh] flex-col items-start justify-center place-self-start px-10 text-left text-gray-600">
            <h2 className="text-3xl font-bold">
              Developing with Low/No code tools on NEAR is here.
            </h2>
            <p className="text-2xl">
              Check this{" "}
              <b>
                <i>non</i>
              </b>{" "}
              exhaustive list of integrations for the NEAR protocol.
            </p>
          </section>

          <div className="mx-auto mt-5 flex min-h-screen w-full max-w-7xl flex-col items-center justify-start space-y-6">
            {records.map(
              ({ name, description, id, image, creator, link, platform }) => (
                <IntegrationCard
                  name={name || ""}
                  description={description || ""}
                  image={image}
                  reverse={false}
                  creator={creator}
                  link={link}
                  platform={platform}
                  id={id}
                  key={id}
                />
              )
            )}
          </div>

          <div className="mt-28 flex items-center justify-center">
            <div className="text-sm text-zinc-600">
              NEAR-WLNC is the project of <b>NEAR Education</b>, 2022
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;

type IntegrationCardProps = LowNoCodeEntry & {
  reverse: boolean;
};

const IntegrationCard = ({
  name,
  description,
  image,
  creator,
  link,
  reverse = false,
  platform,
}: IntegrationCardProps) => {
  return (
    <section
      className={clsx("flex h-80 w-full max-w-7xl justify-center p-6", {
        "flex-row-reverse": reverse,
        "flex-row": !reverse,
      })}
    >
      <div className={clsx("mx-4 w-3/4", { "text-right": reverse })}>
        <a
          href={platform}
          target={"_blank"}
          rel={"noreferrer"}
          className="group inline-block"
        >
          <h2 className="text-3xl font-semibold text-gray-700">{name}</h2>
          <div className="flex">
            <div
              className={clsx(
                "h-px w-full flex-grow scale-x-0 bg-black transition-all duration-200 group-hover:scale-x-100",
                { "origin-right": reverse, "origin-left": !reverse }
              )}
            />
          </div>
        </a>

        <div
          className={clsx(
            "mt-4 flex w-full items-center justify-between space-x-4",
            { "flex-row": !reverse, "flex-row-reverse": reverse }
          )}
        >
          <div className="flex items-center justify-start">
            <div className="mr-4">
              <b className="text-gray-600">by</b>
            </div>

            <a
              href={`https://github.com/${creator?.github}`}
              target={"_blank"}
              rel={"noreferrer"}
            >
              <div className="flex flex-col items-center justify-center">
                <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-gray-700">
                  <Image
                    src={creator?.image?.url || ""}
                    alt={creator?.name || ""}
                    className="object-cover"
                    fill
                  />
                </div>
                <h3 className="text-sm font-medium">{creator?.name}</h3>
              </div>
            </a>
          </div>

          <a
            href={link}
            className="font-semibold underline transition-colors duration-200 hover:text-blue-300 active:text-blue-300"
            target={"_blank"}
            rel={"noreferrer"}
          >
            integration link
          </a>
        </div>

        <p className="text-lg font-medium">{description}</p>
      </div>

      <div className="relative mx-4 w-1/4">
        <a href={platform} target={"_blank"} rel={"noreferrer"}>
          <Image src={image?.url || ""} alt={name || ""} fill />
        </a>
      </div>
    </section>
  );
};
