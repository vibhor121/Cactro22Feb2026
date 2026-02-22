import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Release Checklist',
  description: 'Track software releases through predefined steps',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
