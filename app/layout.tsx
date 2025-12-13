import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "PT Manggala Putra Persada | General Contractor & MEP",
  description:
    "PT Manggala Putra Persada adalah perusahaan General Contractor & MEP untuk proyek pabrik dan perumahan dengan standar profesional.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-white text-gray-900 antialiased">
        {/* NAVBAR */}
        <Navbar />

        {/* MAIN CONTENT */}
        <main>{children}</main>

        {/* FOOTER */}
        <Footer />
      </body>
    </html>
  );
}
