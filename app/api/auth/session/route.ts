import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.replace('Bearer ', '') || null;
    const cookieToken = request.cookies.get('sb-access-token')?.value || null;
    const token = headerToken || cookieToken;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user: { id: user.id, email: user.email } });

  } catch {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
