import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'ZAYKAA — A More Exquisite Way to Dine', template: '%s | ZAYKAA' },
  description: 'Discover exceptional local restaurants, thoughtfully prepared dishes, and a more considered way to order in.',
  applicationName: 'ZAYKAA',
}

export const viewport: Viewport = {
  themeColor: '#FAF6EF',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-IN"><body>{children}</body></html>
}
