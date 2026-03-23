import { db } from "@/db";
import { guests, rsvpResponses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { InvitePage } from "./InvitePage";

interface Props {
  params: { slug: string };
}

export default async function InvitePageRoute({ params }: Props) {
  const guest = await db.query.guests.findFirst({
    where: eq(guests.slug, params.slug),
  });

  if (!guest) notFound();

  const existingRsvp = await db.query.rsvpResponses.findFirst({
    where: eq(rsvpResponses.guestId, guest.id),
  });

  return (
    <InvitePage
      guest={guest}
      existingRsvp={existingRsvp ?? null}
    />
  );
}
