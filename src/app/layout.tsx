import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EMERGENCE - 涌现 | AI 协作生存模拟器',
  description: '观察3个AI角色在陌生世界中协作生存，实时干预AI决策',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-[#050508] text-white min-h-screen overflow-hidden">{children}</body>
    </html>
  )
}
