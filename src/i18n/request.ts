import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
    // We'll prioritize the cookie, otherwise fallback to 'zh-CN'
    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'zh-CN';

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});
