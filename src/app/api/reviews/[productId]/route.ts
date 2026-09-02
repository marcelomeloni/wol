import { NextResponse } from 'next/server';

export async function GET(request: Request, context: { params: Promise<{ productId: string }> }) {
  const params = await context.params;
  const url = `https://npkqxlylgibvposrgqai.supabase.co/rest/v1/reviews?product_id=eq.${params.productId}&select=*,users(name)`;
  const res = await fetch(url, {
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wa3F4bHlsZ2lidnBvc3JncWFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU1Mzk5NCwiZXhwIjoyMDk4MTI5OTk0fQ.3Oy9ac4yWBRv6CAUcXGZa0-lky7sS7JjW1uuQZjkDpQ',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wa3F4bHlsZ2lidnBvc3JncWFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU1Mzk5NCwiZXhwIjoyMDk4MTI5OTk0fQ.3Oy9ac4yWBRv6CAUcXGZa0-lky7sS7JjW1uuQZjkDpQ'
    },
    cache: 'no-store'
  });
  const data = await res.json();
  return NextResponse.json(data);
}