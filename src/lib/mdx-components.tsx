import { MDXComponents } from "mdx/types";
import CodeBlock from "@/components/mdx/CodeBlock";
import Callout from "@/components/mdx/Callout";
import Collapsible from "@/components/mdx/Collapsible";
import Quiz, { Answer } from "@/components/mdx/Quiz";
import Step from "@/components/mdx/Step";
import Comparison from "@/components/mdx/Comparison";
import Mermaid from "@/components/mdx/Mermaid";
import Summary from "@/components/mdx/Summary";
import Tags from "@/components/mdx/Tags";
import ListItem from "@/components/mdx/ListItem";

// 导出组件供 next-mdx-remote 使用
export { default as CodeBlock } from "@/components/mdx/CodeBlock";
export { default as Callout } from "@/components/mdx/Callout";
export { default as Collapsible } from "@/components/mdx/Collapsible";
export { default as Quiz, Answer } from "@/components/mdx/Quiz";
export { default as Step } from "@/components/mdx/Step";
export { default as Comparison } from "@/components/mdx/Comparison";
export { default as Mermaid } from "@/components/mdx/Mermaid";
export { default as Summary } from "@/components/mdx/Summary";
export { default as Tags } from "@/components/mdx/Tags";
export { default as ListItem } from "@/components/mdx/ListItem";

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
  p: (props: any) => {
    // 检测是否是摘要段落（以"**摘要**: "或"摘要："开头）
    const content = String(props.children || "");
    if (content.startsWith("**摘要**: ") || content.startsWith("摘要：")) {
      const summaryText = content.replace(/^\*\*摘要\*\*:\s*/, "").replace(/^摘要：\s*/, "");
      return <Summary>{summaryText}</Summary>;
    }
    return <p className="text-gray-700 leading-relaxed my-4" {...props} />;
  },
  ul: (props) => (
    <ul className="list-none space-y-2 my-4" {...props} />
  ),
  ol: (props) => (
    <ol className="list-decimal list-inside space-y-2 my-4 text-gray-700" {...props} />
  ),
  li: (props: any) => {
    return <ListItem>{props.children}</ListItem>;
  },
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
      const content = String(props.children || "");
      // 检测是否是标签（短文本，没有代码特征）
      const isTag = content.length < 50 && !/[={}\[\]();]/.test(content);
      if (isTag) {
        return (
          <code className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-sm rounded-full font-medium border border-blue-200">
            {props.children}
          </code>
        );
      }
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
  Summary,
  Tags,
  ListItem,
};

export default components;
