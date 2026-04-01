interface TagsProps {
  children: React.ReactNode;
}

export default function Tags({ children }: TagsProps) {
  // 将字符串按空格分割成多个标签
  const content = String(children || "");
  const tags = content.split(/\s+/).filter(tag => tag.trim());

  return (
    <div className="flex flex-wrap gap-2 my-4">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-sm rounded-full font-medium border border-blue-200 hover:border-blue-300 transition-colors cursor-default"
        >
          {tag.replace(/[`]/g, "").trim()}
        </span>
      ))}
    </div>
  );
}
