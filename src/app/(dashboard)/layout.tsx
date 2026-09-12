import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Sidebar />
      <main className="flex-1 p-8 ml-64 overflow-y-auto bg-muted/20">
        {children}
      </main>
    </>
  );
}
