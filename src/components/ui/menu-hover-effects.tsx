import React, { useState } from 'react';

interface NavMenuProps {
  items: { label: string; href: string }[];
}

export default function NavMenu({ items }: NavMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="absolute bg-background inset-0 w-full">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden absolute top-6 right-6 z-20 p-2"
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      >
        <div className={`w-6 h-0.5 bg-foreground mb-1.5 transition-transform duration-300 ${isMenuOpen ? 'transform rotate-45 translate-y-2' : ''}`}></div>
        <div className={`w-6 h-0.5 bg-foreground mb-1.5 transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></div>
        <div className={`w-6 h-0.5 bg-foreground transition-transform duration-300 ${isMenuOpen ? 'transform -rotate-45 -translate-y-2' : ''}`}></div>
      </button>

      <div className={`
        flex items-center justify-center w-full h-full
        md:block md:h-auto md:pt-8
        ${isMenuOpen ? 'block' : 'hidden md:block'}
      `}>
        <ul className={`
          flex flex-col items-center space-y-6
          md:flex-row md:space-y-0 md:space-x-4 md:justify-center
          lg:space-x-8
        `}>
          {items.map((item) => (
            <li key={item.label} className="list-none">
              <a
                href={item.href}
                className="relative inline-block group"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="
                  relative z-10 block uppercase text-foreground
                  font-sans font-semibold transition-colors duration-300
                  group-hover:text-background
                  text-xl py-2 px-3
                  md:text-base md:py-2 md:px-3
                  lg:text-lg lg:py-2 lg:px-4
                ">
                  {item.label}
                </span>
                <span className="
                  absolute inset-0 border-t-2 border-b-2 border-foreground
                  transform scale-y-[2] opacity-0
                  transition-all duration-300 origin-center
                  group-hover:scale-y-100 group-hover:opacity-100
                " />
                <span className="
                  absolute top-[2px] left-0 w-full h-full bg-foreground
                  transform scale-0 opacity-0
                  transition-all duration-300 origin-top
                  group-hover:scale-100 group-hover:opacity-100
                " />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
