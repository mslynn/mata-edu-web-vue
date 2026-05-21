import storyCover1 from "~/assets/fengmain/screen1.png";
import storyCover2 from "~/assets/fengmain/screen2.png";
import storyCover3 from "~/assets/fengmain/screen3.png";
import storyCover4 from "~/assets/fengmain/screen4.png";
import storyCover5 from "~/assets/fengmain/screen5.png";
import storyCover6 from "~/assets/fengmain/screen6.png";
import storyCover7 from "~/assets/fengmain/screen7.png";
import storyCover8 from "~/assets/fengmain/screen8.png";

const STORY_BOOKSHELF_COVER_POOL = [
  storyCover1,
  storyCover2,
  storyCover3,
  storyCover4,
  storyCover5,
  storyCover6,
  storyCover7,
  storyCover8,
];

const resolveExistingCover = (record: Record<string, unknown>) => {
  const candidateKeys = ["coverUrl", "cover", "cover_url"];
  for (const key of candidateKeys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
};

const getStableCoverIndex = (seed: string) => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return hash % STORY_BOOKSHELF_COVER_POOL.length;
};

export const resolveStoryBookshelfCover = (
  record: Record<string, unknown>,
  index: number,
  title: string,
) => {
  const existingCover = resolveExistingCover(record);
  if (existingCover) {
    return existingCover;
  }

  const seed = String(
    record.bookId ??
      record.id ??
      record.storyId ??
      record.title ??
      title ??
      index,
  ).trim();

  return STORY_BOOKSHELF_COVER_POOL[getStableCoverIndex(seed || String(index))];
};
