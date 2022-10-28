import airtable from "airtable";
import { env } from "../env/server.mjs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LowerCaseObjectKeys<T extends Record<string, any>> = {
  [K in keyof T as K extends string ? Lowercase<K> : K]: T[K];
};

/**
 * Copy the passed in object while converting the keys of the object to lower case.
 * Only shallowly (1 level deep) converts keys.
 *
 * @param objectToLowerCase - The object whose keys to convert to lower case.
 */
export function lowerCaseObjectKeys<
  ObjectValues extends Record<string, unknown> = Record<string, unknown>
>(objectToLowerCase: ObjectValues): LowerCaseObjectKeys<ObjectValues> {
  return Object.keys(objectToLowerCase).reduce(
    (fieldObject, currentKey) => ({
      ...fieldObject,
      [currentKey.toLowerCase()]: objectToLowerCase[currentKey],
    }),
    {}
  ) as LowerCaseObjectKeys<ObjectValues>;
}

export interface ImageField {
  url: string;
}

export interface LowNoCodeEntry {
  id: string;
  name?: string;
  description?: string;
  image?: ImageField;
  creator: LowNoCodeCreator;
  link: string;
  platform: string;
}

export interface LowNoCodeDetail extends LowNoCodeEntry {
  text?: string;
}

export interface LowNoCodeCreator {
  id: string;
  name: string;
  github?: string;
  image?: ImageField;
}

/**
 * Extract the first image from an image array;
 */
export function extractImageField<Input extends { image?: Array<ImageField> }>(
  input: Input
): Omit<Input, "image"> & { image?: ImageField } {
  if (input.image && input.image.length > 0 && input.image[0]) {
    return { ...input, image: input.image[0] };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { image, ...rest } = input;

  return rest;
}

/**
 * Retrieve all the records from the Low/No code table in Airtable.
 */
export async function fetchAllRecords(): Promise<Array<LowNoCodeEntry>> {
  try {
    airtable.configure({
      apiKey: env.AIRTABLE_API_KEY,
    });

    const connection = airtable.base(env.AIRTABLE_BASE_ID);

    const records = new Promise<LowNoCodeEntry[]>((resolve, reject) => {
      connection(env.AIRTABLE_TABLE_ID)
        .select({
          fields: [
            "Name",
            "Description",
            "Image",
            "Creator",
            "Link",
            "Platform",
          ],
          sort: [{ field: "ID", direction: "asc" }],
        })
        .firstPage(async (error, records) => {
          if (error || !records) {
            reject(error);
            return;
          }

          const creators = new Map<string, boolean>();
          const creatorFetches: Array<Promise<LowNoCodeCreator>> = [];

          const entries = records.map(({ id, fields }) => {
            const entry = {
              id,
              ...lowerCaseObjectKeys(fields),
            } as Omit<LowNoCodeEntry, "creator"> & { creator: string[] };

            if (
              entry.creator &&
              entry.creator.length > 0 &&
              !creators.has(entry.creator[0] as string)
            ) {
              creatorFetches.push(
                new Promise((resolve, reject) => {
                  connection(env.AIRTABLE_CREATOR_TABLE_ID).find(
                    entry.creator[0] as string,
                    (error, record) => {
                      if (error || !record) {
                        reject(error);
                        return;
                      }

                      const creator = {
                        id: record.id,
                        ...lowerCaseObjectKeys(record.fields),
                      } as LowNoCodeCreator;

                      resolve(
                        extractImageField(
                          creator as { image?: Array<ImageField> }
                        ) as LowNoCodeCreator
                      );
                    }
                  );
                })
              );
              creators.set(entry.creator[0] as string, true);
            }

            return extractImageField(
              entry as { image?: Array<ImageField> }
            ) as Omit<LowNoCodeEntry, "creator"> & { creator?: Array<string> };
          });

          const fetchedCreators = await Promise.all(creatorFetches);

          const creatorsMap = new Map<string, LowNoCodeCreator>(
            fetchedCreators.map((creator) => [creator.id, creator])
          );

          resolve(
            entries.map((entry) => {
              if (
                entry.creator &&
                entry.creator.length > 0 &&
                creatorsMap.has(entry.creator[0] as string)
              ) {
                return {
                  ...entry,
                  creator: creatorsMap.get(
                    entry.creator[0] as string
                  ) as LowNoCodeCreator,
                };
              }

              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { creator, ...rest } = entry;

              return rest as LowNoCodeEntry;
            })
          );
        });
    });

    return records;
  } catch (error) {
    console.error(error);
    return [];
  }
}

/**
 * Retrieve a single record from the Low/No code table in Airtable.
 */
export async function fetchRecordByName(
  name: string
): Promise<LowNoCodeDetail | null> {
  try {
    airtable.configure({
      apiKey: env.AIRTABLE_API_KEY,
    });

    const connection = airtable.base(env.AIRTABLE_BASE_ID);

    const [record] = await new Promise<LowNoCodeDetail[]>((resolve, reject) => {
      connection(env.AIRTABLE_TABLE_ID)
        .select({
          filterByFormula: `{Name} = '${name}'`,
          maxRecords: 1,
        })
        .firstPage((error, records) => {
          if (error || !records) {
            reject(error);
            return;
          }

          resolve(
            records.map(
              ({ id, fields }) =>
                ({
                  id,
                  ...lowerCaseObjectKeys(fields),
                } as LowNoCodeDetail)
            )
          );
        });
    });

    return record ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
}
