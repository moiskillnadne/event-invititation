import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { guests, rsvpResponses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { weddingConfig } from "@/data/wedding-config";

export async function GET(req: NextRequest) {
  const password = req.nextUrl.searchParams.get("password");

  if (password !== weddingConfig.adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allGuests = await db.select().from(guests);

  const guestsWithRsvp = await Promise.all(
    allGuests.map(async (guest) => {
      const rsvp = await db.query.rsvpResponses.findFirst({
        where: eq(rsvpResponses.guestId, guest.id),
      });

      return {
        id: guest.id,
        slug: guest.slug,
        names: guest.names,
        maxGuests: guest.maxGuests,
        attending: rsvp?.attending ?? null,
        guestCount: rsvp?.guestCount ?? null,
        respondedAt: rsvp?.respondedAt ?? null,
      };
    })
  );

  return NextResponse.json({ guests: guestsWithRsvp });
}
