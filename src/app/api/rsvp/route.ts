import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rsvpResponses, guests } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { guestId, attending, guestCount } = body;

    if (typeof guestId !== "number" || typeof attending !== "boolean") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Verify guest exists
    const guest = await db.query.guests.findFirst({
      where: eq(guests.id, guestId),
    });

    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    const count = attending
      ? Math.min(Math.max(1, guestCount || 1), guest.maxGuests)
      : 0;

    // Upsert: check if response already exists
    const existing = await db.query.rsvpResponses.findFirst({
      where: eq(rsvpResponses.guestId, guestId),
    });

    let rsvp;
    if (existing) {
      const updated = await db
        .update(rsvpResponses)
        .set({
          attending,
          guestCount: count,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(rsvpResponses.id, existing.id))
        .returning();
      rsvp = updated[0];
    } else {
      const inserted = await db
        .insert(rsvpResponses)
        .values({
          guestId,
          attending,
          guestCount: count,
        })
        .returning();
      rsvp = inserted[0];
    }

    return NextResponse.json({ rsvp });
  } catch (error) {
    console.error("RSVP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
