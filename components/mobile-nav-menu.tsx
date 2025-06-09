"use client"

import * as React from 'react'; // Added React import
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { XIcon, SearchIcon } from 'lucide-react'; // Or other appropriate icons

interface MobileNavMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { href: '/', label: '首页' },
  { href: '/posts', label: '文章' },
  { href: '/categories', label: '分类' },
  { href: '/tags', label: '标签' },
  { href: '/about', label: '关于' },
];

export function MobileNavMenu({ isOpen, onClose }: MobileNavMenuProps) {
  if (!isOpen) {
    return null;
  }

  // Scroll lock effect
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // Cleanup function to reset overflow when component unmounts or isOpen changes
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div
      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-fadeIn" // Adjusted z-index to z-40
      onClick={onClose} // Close when overlay is clicked
    >
      <div
        className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-background p-6 shadow-xl transition-transform transform translate-x-0 animate-slideInFromRight md:hidden z-50" // Added z-50 and md:hidden (though parent has it)
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
      >
        <div className="flex items-center justify-between mb-6">
          <span className="font-bold text-lg">菜单</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XIcon className="h-5 w-5" />
            <span className="sr-only">关闭菜单</span>
          </Button>
        </div>

        <nav className="flex flex-col space-y-4 mb-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-lg font-medium text-foreground hover:text-primary transition-colors"
              onClick={onClose} // Close menu on link click
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Button variant="outline" className="w-full justify-start">
          <SearchIcon className="h-4 w-4 mr-2" />
          搜索
        </Button>
      </div>
    </div>
  );
}
