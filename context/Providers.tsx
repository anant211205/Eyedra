'use client';

import { SessionProvider } from 'next-auth/react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Roboto } from 'next/font/google';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
cssVariables: true,
    typography: {
        fontFamily: 'var(--font-roboto)',
    },
});

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-roboto',
});
export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
                <SessionProvider>{children}</SessionProvider>
            </ThemeProvider>
        </AppRouterCacheProvider>
    );
}
