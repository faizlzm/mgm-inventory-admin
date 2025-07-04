import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar | MGM Inventory System",
  description: "Daftar akun baru untuk sistem manajemen inventaris MGM",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
