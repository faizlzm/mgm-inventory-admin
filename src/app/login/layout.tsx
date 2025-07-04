import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk | MGM Inventory System",
  description: "Masuk ke sistem manajemen inventaris MGM",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
