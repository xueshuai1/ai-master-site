import { MDXComponents } from "mdx/types";
import CodeBlock from "@/components/mdx/CodeBlock";
import Callout from "@/components/mdx/Callout";
import Collapsible from "@/components/mdx/Collapsible";
import Quiz, { Answer } from "@/components/mdx/Quiz";
import Step from "@/components/mdx/Step";
import Comparison from "@/components/mdx/Comparison";
import Mermaid from "@/components/mdx/Mermaid";

// 导出组件供 next-mdx-remote 使用
export { default as CodeBlock } from "@/components/mdx/CodeBlock";
export { default as Callout } from "@/components/mdx/Callout";
export { default as Collapsible } from "@/components/mdx/Collapsible";
export { default as Quiz, Answer } from "@/components/mdx/Quiz";
export { default as Step } from "@/components/mdx/Step";
export { default as Comparison } from "@/components/mdx/Comparison";
export { default as Mermaid } from "@/components/mdx/Mermaid";

// 自定义 MDX 组件映射
export const components: MDXComponents = {
  // 覆盖默认组件
  h1: (props) => (
    <h1 className="text-4xl font-bold text-gray-900 mt-8 mb-4" {...props} />
  ),
  h2: (props) => (
    <h2 className="text-3xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-gray-200" {...props} />
  ),
  h3: (props) => (
    <h3 className="text-2xl font-bold text-gray-900 mt-6 mb-3" {...props} />
  ),
  h4: (props) => (
    <h4 className="text-xl font-bold text-gray-900 mt-4 mb-2" {...props} />
  ),
  p: (props) => (
    <p className="text-gray-700 leading-relaxed my-4" {...props} />
  ),
  ul: (props) => (
    <ul className="list-disc list-inside space-y-2 my-4 text-gray-700" {...props} />
  ),
  ol: (props) => (
    <ol className="list-decimal list-inside space-y-2 my-4 text-gray-700" {...props} />
  ),
  li: (props) => (
    <li className="pl-2" {...props} />
  ),
  blockquote: (props) => (
    <blockquote
      className="border-l-4 border-indigo-500 pl-4 py-2 my-6 bg-indigo-50 italic text-gray-700"
      {...props}
    />
  ),
  hr: (props) => (
    <hr className="my-8 border-t-2 border-gray-200" {...props} />
  ),
  table: (props) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full border-collapse" {...props} />
    </div>
  ),
  th: (props) => (
    <th
      className="px-4 py-3 bg-gray-100 font-bold text-left border-b-2 border-gray-300"
      {...props}
    />
  ),
  td: (props) => (
    <td className="px-4 py-3 border-b border-gray-200" {...props} />
  ),
  a: (props) => (
    <a
      className="text-indigo-600 hover:text-indigo-800 underline font-medium"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  img: (props) => (
    <img
      className="max-w-full h-auto rounded-xl shadow-md my-6"
      {...props}
    />
  ),
  code: (props: any) => {
    // 内联代码
    if (!props.className) {
      return (
        <code className="px-2 py-0.5 bg-gray-100 rounded text-sm font-mono text-pink-600">
          {props.children}
        </code>
      );
    }
    return <CodeBlock {...props} />;
  },
  pre: (props: any) => {
    // 如果 pre 包含 code，由 code 组件处理
    return <>{props.children}</>;
  },

  // 自定义组件
  CodeBlock,
  Callout,
  Collapsible,
  Quiz,
  Answer,
  Step,
  Comparison,
  Mermaid,
};

export default components;
