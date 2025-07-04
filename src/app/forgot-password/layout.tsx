import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lupa Kata Sandi | MGM Inventory System",
  description: "Reset kata sandi untuk sistem manajemen inventaris MGM",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
