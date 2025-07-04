import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beranda | MGM Inventory System",
  description: "Dashboard utama sistem manajemen inventaris MGM",
};

export default function BerandaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
