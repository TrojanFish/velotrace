import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
    // Simple custom proxy to ensure NEXT_LOCALE cookie exists
    // This helps next-intl/server pick up the right language
    const locale = request.cookies.get('NEXT_LOCALE')?.value || 'zh-CN';
    const response = NextResponse.next();

    if (!request.cookies.has('NEXT_LOCALE')) {
        response.cookies.set('NEXT_LOCALE', 'zh-CN', { path: '/' });
    }

    return response;
}

export const config = {
    // Skip all internal paths (_next)
    matcher: ['/((?!api|_next|.*\\..*).*)'],
};
