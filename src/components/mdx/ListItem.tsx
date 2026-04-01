interface ListItemProps {
  children: React.ReactNode;
}

export default function ListItem({ children }: ListItemProps) {
  const content = String(children || "");
  
  // 检测是否以 ✅ 或 ❌ 开头
  const isPositive = content.startsWith("✅");
  const isNegative = content.startsWith("❌");
  
  if (isPositive || isNegative) {
    const text = content.replace(/^[✅❌]\s*/, "").trim();
    return (
      <li className="flex items-start gap-2 my-2">
        <span className={`text-lg shrink-0 ${isPositive ? "" : ""}`}>
          {isPositive ? "✅" : "❌"}
        </span>
        <span className={`flex-1 ${isPositive ? "text-green-700" : "text-red-700"} font-medium`}>
          {text}
        </span>
      </li>
    );
  }
  
  // 默认列表项
  return <li className="pl-2">{children}</li>;
}
