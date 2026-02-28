"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="w-full border-b border-stone-200">
      <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-semibold text-stone-800 tracking-tight hover:text-stone-600 transition-colors"
        >
          semantickle
        </Link>
        <div className="flex gap-4 text-sm">
          <Link
            href="/"
            className={`transition-colors ${
              pathname === "/"
                ? "text-stone-800 font-medium"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            play
          </Link>
          <Link
            href="/calculator"
            className={`transition-colors ${
              pathname === "/calculator"
                ? "text-stone-800 font-medium"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            calculator
          </Link>
        </div>
      </div>
    </nav>
  );
}
