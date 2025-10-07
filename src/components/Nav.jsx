import { useState } from "react";
import logo from "../assets/logo.png";

export default function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-black/70 backdrop-blur border-b border-zinc-800">
      <div className="mx-auto w-[min(1100px,92%)] flex items-center justify-between py-3">
        <div className="flex flex-row items-center gap-3">
          <a href="#home" className="inline-flex flex-col items-center gap-2">
            <img
              src={logo}
              alt="Logo Marokkaanse Moskee Houthalen"
              className="size-12 rounded-full border border-zinc-700 object-contain"
            />
            <span className="font-semibold tracking-wide">مسجد المسلمين</span>
          </a>
        </div>

        <button
          className="md:hidden border border-zinc-700 rounded-lg px-2 py-1"
          aria-label="Menu openen"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
        <nav
          className={`md:flex gap-3 ${
            open
              ? "absolute right-[4%] top-14 bg-zinc-900 border border-zinc-800 rounded-lg p-2 flex flex-col"
              : "hidden md:flex"
          }`}
        >
          <a className="px-2 py-1 rounded hover:bg-zinc-800" href="#welkom">
            Welkom
          </a>
          <a
            className="px-2 py-1 rounded hover:bg-zinc-800"
            href="#gebedstijden"
          >
            Gebedstijden
          </a>
          <a className="px-2 py-1 rounded hover:bg-zinc-800" href="#doneren">
            Doneren
          </a>
          <a className="px-2 py-1 rounded hover:bg-zinc-800" href="#contact">
            Locatie & Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
