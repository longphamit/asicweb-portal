import { NextResponse } from "next/server";
import { getAllPublications, createPublication } from '../../../lib/controller/publicationController';;

export async function GET(req) {
  const publications = await getAllPublications();
  return NextResponse.json(publications);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const publication = await createPublication(body);
    return NextResponse.json(publication, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
