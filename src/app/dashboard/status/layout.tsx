import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Status Peminjaman | MGM Inventory System",
  description: "Kelola status peminjaman barang di sistem inventaris MGM",
};

export default function StatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
