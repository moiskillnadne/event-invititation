import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { guests, rsvpResponses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { weddingConfig } from "@/data/wedding-config";

interface CreateGuestBody {
  slug: string;
  names: string;
  greeting: string | null;
  description: string;
  photo: string | null;
  maxGuests: number;
}

interface DeleteGuestBody {
  guestId: number;
}

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const authenticate = (req: NextRequest): boolean => {
  const password = req.nextUrl.searchParams.get("password");
  return password === weddingConfig.adminPassword;
};

export async function GET(req: NextRequest) {
  if (!authenticate(req)) {
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

export async function POST(req: NextRequest) {
  if (!authenticate(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as CreateGuestBody;
    const { slug, names, greeting, description, photo, maxGuests } = body;

    if (!slug?.trim() || !names?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: "Заполните все обязательные поля" },
        { status: 400 }
      );
    }

    if (!SLUG_PATTERN.test(slug)) {
      return NextResponse.json(
        { error: "Слаг может содержать только латиницу, цифры и дефисы" },
        { status: 400 }
      );
    }

    const clampedMaxGuests = Math.min(Math.max(1, maxGuests || 2), 20);

    const existing = await db.query.guests.findFirst({
      where: eq(guests.slug, slug),
    });

    if (existing) {
      return NextResponse.json(
        { error: "Этот слаг уже занят" },
        { status: 409 }
      );
    }

    const created = db
      .insert(guests)
      .values({
        slug: slug.trim(),
        names: names.trim(),
        greeting: greeting?.trim() || null,
        description: description.trim(),
        photo: photo?.trim() || null,
        maxGuests: clampedMaxGuests,
      })
      .returning()
      .get();

    return NextResponse.json({ guest: created }, { status: 201 });
  } catch (error) {
    console.error("Create guest error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!authenticate(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as DeleteGuestBody;
    const { guestId } = body;

    if (!guestId || typeof guestId !== "number") {
      return NextResponse.json(
        { error: "Укажите ID гостя" },
        { status: 400 }
      );
    }

    const guest = await db.query.guests.findFirst({
      where: eq(guests.id, guestId),
    });

    if (!guest) {
      return NextResponse.json(
        { error: "Гость не найден" },
        { status: 404 }
      );
    }

    db.delete(rsvpResponses).where(eq(rsvpResponses.guestId, guestId)).run();
    db.delete(guests).where(eq(guests.id, guestId)).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete guest error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
