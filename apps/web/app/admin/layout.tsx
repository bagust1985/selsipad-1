export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Admin layout - no BottomNav, just wrapper
  // Root layout handles html/body tags
  return <div className="min-h-screen bg-black p-6">{children}</div>;
}
