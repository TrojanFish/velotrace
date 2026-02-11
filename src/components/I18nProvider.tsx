import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { Providers as OriginalProviders } from "./Providers";

export async function I18nProvider({ children }: { children: React.ReactNode }) {
    const messages = await getMessages();
    const locale = await getLocale();

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            <OriginalProviders>
                {children}
            </OriginalProviders>
        </NextIntlClientProvider>
    );
}
