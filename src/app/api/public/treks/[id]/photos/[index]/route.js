import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getPublicPackage } from '@/lib/publicCatalog';
import { Package } from '@/models/package.model';
export async function GET(request, { params }) {
  const { id, index } = await params;
  if (!/^\d+$/.test(index) || !mongoose.Types.ObjectId.isValid(id)) return new Response(null, { status: 404 });
  const pkg = await getPublicPackage(id);
  if (!pkg || pkg.category !== 'trek' || Number(index) >= pkg.photos.length) return new Response(null, { status: 404 });
  const [record] = await Package.aggregate([{ $match: { _id: new mongoose.Types.ObjectId(id), status: 'active' } }, { $project: { photo: { $arrayElemAt: ['$photos', Number(index)] } } }]);
  const photo = record?.photo || '';
  const headers = { 'Cache-Control': 'public, max-age=300, s-maxage=300', 'X-Content-Type-Options': 'nosniff' };
  if (/^https?:\/\//i.test(photo) || photo.startsWith('/')) return NextResponse.redirect(new URL(photo, request.url), { headers });
  const data = photo.match(/^data:(image\/(?:png|jpeg|webp|gif|avif));base64,([a-z0-9+/=\s]+)$/i);
  if (!data) return new Response(null, { status: 404 });
  return new Response(Buffer.from(data[2].replace(/\s/g, ''), 'base64'), { headers: { ...headers, 'Content-Type': data[1] } });
}

