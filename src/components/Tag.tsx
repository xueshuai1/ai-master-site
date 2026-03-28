"use client";

import Link from "next/link";

interface TagProps {
  id: string;
  name: string;
  icon?: string;
  group?: "tech" | "difficulty" | "scenario";
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outlined" | "filled";
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

const sizeClasses = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
  lg: "px-4 py-2 text-base",
};

const variantClasses = {
  default: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  outlined: "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50",
  filled: "bg-blue-500 text-white hover:bg-blue-600",
};

const groupColors = {
  tech: "bg-blue-50 text-blue-700 border-blue-200",
  difficulty: "bg-yellow-50 text-yellow-700 border-yellow-200",
  scenario: "bg-green-50 text-green-700 border-green-200",
};

export default function Tag({
  id,
  name,
  icon,
  group = "tech",
  size = "md",
  variant = "default",
  href,
  onClick,
  active = false,
}: TagProps) {
  const baseClasses = `
    inline-flex items-center gap-1 rounded-full font-medium transition-all
    ${sizeClasses[size]}
    ${active ? "ring-2 ring-blue-500 ring-offset-1" : ""}
    ${variant === "default" ? groupColors[group] : variantClasses[variant]}
  `;

  const content = (
    <>
      {icon && <span className="text-sm">{icon}</span>}
      <span>{name}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button className={baseClasses} onClick={onClick}>
      {content}
    </button>
  );
}
