import { notFound } from "next/navigation";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { fetchNotes, NOTES_PER_PAGE } from "@/lib/api";
import { NOTE_TAGS } from "@/types/note";
import type { NoteTag } from "@/types/note";
import NotesClient from "./Notes.client";

interface NotesProps {
  params: Promise<{ slug: string[] }>;
}

const isNoteTag = (value: string): value is NoteTag =>
  (NOTE_TAGS as readonly string[]).includes(value);

const getTag = (filter: string): NoteTag | undefined => {
  if (filter === "all") {
    return undefined;
  }

  if (isNoteTag(filter)) {
    return filter;
  }

  notFound();
};

const Notes = async ({ params }: NotesProps) => {
  const { slug } = await params;
  const tag = getTag(slug[0]);

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["notes", tag, 1, ""],
    queryFn: () =>
      fetchNotes({ page: 1, perPage: NOTES_PER_PAGE, search: "", tag }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient key={tag ?? "all"} tag={tag} />
    </HydrationBoundary>
  );
};

export default Notes;
