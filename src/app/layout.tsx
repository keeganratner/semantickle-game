import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "semantickle",
  description: "a daily word puzzle based on word vectors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 text-stone-800 antialiased flex flex-col">
        <Nav />
        <div className="flex-1">{children}</div>
        <footer className="max-w-lg mx-auto px-4 py-8 text-center text-xs text-stone-400">
          <p>
            created by keegan ratner.{" "}
            <a
              href="https://github.com/keeganratner"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              style={{ color: "#aa7faa" }}
            >
              github
            </a>
            {" "}&middot;{" "}
            <a
              href="https://www.linkedin.com/in/keegan-ratner/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              style={{ color: "#aa7faa" }}
            >
              linkedin
            </a>
          </p>
          <p className="mt-2 relative inline-flex items-center justify-center gap-1 group">
            <span className="cursor-help text-stone-400 inline-flex items-center gap-1">
              how it works
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-stone-100 border border-stone-200 text-stone-600 text-xs p-3 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md">
              words are compared using vector embeddings from Stanford&apos;s GloVe (Global Vectors for Word Representation). your guesses are scored by cosine similarity to the target word, so words closer in meaning rank higher.
            </span>
          </p>
        </footer>
      </body>
    </html>
  );
}
