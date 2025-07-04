import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Sanksi | MGM Inventory System",
  description: "Kelola sanksi dan pelanggaran peminjaman barang di sistem inventaris MGM",
};

export default function SanksiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
