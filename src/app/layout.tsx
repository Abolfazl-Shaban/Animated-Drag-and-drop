import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DragDropProvider } from "./components/DragDropProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Animated Drag and Drop",
  description: "Created by Abolfazl-Shaban",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.className} min-h-full px-2 flex flex-col`}>
       
        <DragDropProvider>
          {children}
        </DragDropProvider>
      </body>
    </html>
  );
}