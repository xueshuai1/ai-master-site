"use client";

interface CalloutProps {
  type?: "info" | "warning" | "success" | "error" | "tip";
  title?: string;
  children: React.ReactNode;
  icon?: string;
}

export default function Callout({ 
  type = "info", 
  title, 
  children,
  icon 
}: CalloutProps) {
  const styles = {
    info: {
      bg: "bg-blue-50",
      border: "border-blue-500",
      text: "text-blue-800",
      icon: icon || "ℹ️",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-500",
      text: "text-yellow-800",
      icon: icon || "⚠️",
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-500",
      text: "text-green-800",
      icon: icon || "✅",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-500",
      text: "text-red-800",
      icon: icon || "❌",
    },
    tip: {
      bg: "bg-purple-50",
      border: "border-purple-500",
      text: "text-purple-800",
      icon: icon || "💡",
    },
  };

  const style = styles[type];

  return (
    <div className={`my-6 ${style.bg} border-l-4 ${style.border} p-5 rounded-r-lg`}>
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0">{style.icon}</span>
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold ${style.text} mb-2`}>
              {title}
            </h4>
          )}
          <div className={`${style.text} text-sm leading-relaxed`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
