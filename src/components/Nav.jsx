import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  const navLinks = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/over-ons', label: 'Over Ons' },
    { to: '/gebedstijden', label: 'Gebedstijden' },
    { to: '/kennisbank', label: 'Kennisbank', highlight: true },
    { to: '/activiteiten', label: 'Activiteiten' },
    { to: '/contact', label: 'Contact' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-lg border-b border-zinc-800 shadow-lg">
      <div className="mx-auto w-[min(1100px,92%)] flex items-center justify-between py-3">
        <div className="flex flex-row items-center gap-3">
          <Link to="/" className="inline-flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
            <img
              src={logo}
              alt="Logo Marokkaanse Moskee Houthalen"
              className="size-12 rounded-full border border-zinc-700 object-contain hover:border-primary transition-colors"
            />
            <span className="font-semibold tracking-wide text-xs">مسجد المسلمين</span>
          </Link>
        </div>

        <button
          className="lg:hidden border border-zinc-700 rounded-lg px-3 py-2 hover:border-primary transition-colors"
          aria-label="Menu openen"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span className="text-lg">{open ? '✕' : '☰'}</span>
        </button>

        <nav
          className={`lg:flex gap-1 ${
            open
              ? "absolute left-0 right-0 top-16 bg-zinc-900 border-b border-zinc-800 p-4 flex flex-col shadow-2xl"
              : "hidden lg:flex"
          }`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              className={`px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-sm ${
                location.pathname === link.to 
                  ? 'bg-zinc-800 text-primary font-semibold' 
                  : link.highlight 
                    ? 'text-primary' 
                    : ''
              }`}
              to={link.to}
              onClick={() => setOpen(false)}
            >
              {link.icon && <span>{link.icon} </span>}
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
