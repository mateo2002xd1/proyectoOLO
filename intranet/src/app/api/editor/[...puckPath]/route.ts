import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data', 'pages');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ puckPath: string[] }> }
) {
  const { puckPath } = await params;
  const slug = puckPath.join('-');
  const filePath = path.join(dataDir, `${slug}.json`);
  
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  }
  
  return NextResponse.json({}, { status: 404 });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ puckPath: string[] }> }
) {
  const { puckPath } = await params;
  const slug = puckPath.join('-');
  const data = await request.json();
  const filePath = path.join(dataDir, `${slug}.json`);
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  
  return NextResponse.json({ success: true });
}
