import type { Metadata } from "next";
import "../../styles/globals.css";

export const metadata: Metadata = {
  title: "Poop Launcher - Sacred Launch Game",
  description: "An artistic poop launching game with mystical elements",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#FDF1D4',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {children}
        </div>
      </body>
    </html>
  );
}
