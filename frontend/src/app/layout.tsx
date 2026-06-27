import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Access any old webpage',
  description: 'Access any old webpage - Built with Rust + Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
