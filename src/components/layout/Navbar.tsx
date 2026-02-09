import Link from "next/link";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-void border-b-3 border-border h-16 flex items-center px-4 md:px-8">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-neon brutal-shadow flex items-center justify-center">
            <span className="text-void font-bold text-lg font-[family-name:var(--font-heading)]">
              I
            </span>
          </div>
          <span className="font-[family-name:var(--font-heading)] text-xl font-bold uppercase tracking-wider text-text group-hover:text-neon transition-colors">
            Ignite<span className="text-neon">BCH</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="font-[family-name:var(--font-heading)] text-sm uppercase tracking-wider text-text-dim hover:text-neon transition-colors"
          >
            Tokens
          </Link>
          <Link
            href="/create"
            className="font-[family-name:var(--font-heading)] text-sm uppercase tracking-wider text-text-dim hover:text-neon transition-colors"
          >
            Launch
          </Link>
          <a
            href="#"
            className="font-[family-name:var(--font-heading)] text-sm uppercase tracking-wider text-text-dim hover:text-neon transition-colors"
          >
            Docs
          </a>
        </div>

        {/* Wallet Connect Button */}
        <button className="brutal-btn bg-neon text-void font-[family-name:var(--font-heading)] font-bold text-sm uppercase tracking-wider px-5 py-2 border-3 border-neon hover:bg-void hover:text-neon transition-colors">
          Connect Wallet
        </button>
      </div>
    </nav>
  );
}
