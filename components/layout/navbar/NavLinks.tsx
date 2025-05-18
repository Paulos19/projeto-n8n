"use client";
import { NavLinkItem } from "./NavLinkItem";

interface NavLink {
  href: string;
  label: string;
}

interface NavLinksProps {
  links: NavLink[];
  onLinkClick?: () => void;
  isMobile?: boolean;
  className?: string;
}

export function NavLinks({ links, onLinkClick, isMobile, className }: NavLinksProps) {
  const baseClasses = isMobile ? "space-y-1 flex flex-col items-start" : "flex items-center space-x-1";
  return (
    <nav className={`${baseClasses} ${className || ''}`}>
      {links.map((link) => (
        <NavLinkItem
          key={link.href}
          href={link.href}
          label={link.label}
          onClick={onLinkClick}
          isMobile={isMobile}
        />
      ))}
    </nav>
  );
}