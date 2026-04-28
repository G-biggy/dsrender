'use client';

import dynamic from 'next/dynamic';
import { ThemeProvider } from '@/context/ThemeContext';

const App = dynamic(() => import('@/components/App'), { ssr: false });

export default function Home() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}
