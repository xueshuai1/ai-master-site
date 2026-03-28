"use client";

import Link from "next/link";
import tagsData from "@/content/meta/tags.json";

interface TagCloudProps {
  tagCounts?: Record<string, number>;
  limit?: number;
  group?: "all" | "tech" | "difficulty" | "scenario";
}

export default function TagCloud({ tagCounts = {}, limit, group = "all" }: TagCloudProps) {
  const tags = tagsData as any;

  const getTagSize = (count: number, maxCount: number) => {
    if (maxCount === 0) return "text-sm";
    const ratio = count / maxCount;
    if (ratio > 0.8) return "text-xl font-bold";
    if (ratio > 0.6) return "text-lg font-semibold";
    if (ratio > 0.4) return "text-base font-medium";
    return "text-sm";
  };

  const renderTechTags = () => {
    const techTags = tags.tagGroups.find((g: any) => g.id === "tech")?.tags || [];
    const maxCount = Math.max(...techTags.map((id: string) => tagCounts[id] || 0), 1);

    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>🔬</span> 技术领域
        </h3>
        <div className="flex flex-wrap gap-3">
          {techTags.map((tagId: string) => {
            const tag = tags.techDomains[tagId as keyof typeof tags.techDomains];
            const count = tagCounts[tagId] || 0;
            return (
              <Link
                key={tagId}
                href={`/tags/${tagId}`}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                  bg-blue-50 text-blue-700 border border-blue-200
                  hover:bg-blue-100 hover:border-blue-300 transition-all
                  ${getTagSize(count, maxCount)}
                `}
              >
                <span>{tag.icon}</span>
                <span>{tag.name}</span>
                {count > 0 && (
                  <span className="text-xs bg-blue-100 px-1.5 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDifficultyTags = () => {
    const diffTags = tags.tagGroups.find((g: any) => g.id === "difficulty")?.tags || [];
    const maxCount = Math.max(...diffTags.map((id: string) => tagCounts[id] || 0), 1);

    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>⭐</span> 难度等级
        </h3>
        <div className="flex flex-wrap gap-3">
          {diffTags.map((tagId: string) => {
            const tag = tags.difficulties[tagId as keyof typeof tags.difficulties];
            const count = tagCounts[tagId] || 0;
            return (
              <Link
                key={tagId}
                href={`/tags/${tagId}`}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                  bg-yellow-50 text-yellow-700 border border-yellow-200
                  hover:bg-yellow-100 hover:border-yellow-300 transition-all
                  ${getTagSize(count, maxCount)}
                `}
              >
                <span>{tag.icon}</span>
                <span>{tag.name}</span>
                {count > 0 && (
                  <span className="text-xs bg-yellow-100 px-1.5 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  const renderScenarioTags = () => {
    const scenarioTags = tags.tagGroups.find((g: any) => g.id === "scenario")?.tags || [];
    const maxCount = Math.max(...scenarioTags.map((id: string) => tagCounts[id] || 0), 1);

    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>🎯</span> 应用场景
        </h3>
        <div className="flex flex-wrap gap-3">
          {scenarioTags.map((tagId: string) => {
            const tag = tags.scenarios[tagId as keyof typeof tags.scenarios];
            const count = tagCounts[tagId] || 0;
            return (
              <Link
                key={tagId}
                href={`/tags/${tagId}`}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                  bg-green-50 text-green-700 border border-green-200
                  hover:bg-green-100 hover:border-green-300 transition-all
                  ${getTagSize(count, maxCount)}
                `}
              >
                <span>{tag.icon}</span>
                <span>{tag.name}</span>
                {count > 0 && (
                  <span className="text-xs bg-green-100 px-1.5 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      {group === "all" || group === "tech" ? renderTechTags() : null}
      {group === "all" || group === "difficulty" ? renderDifficultyTags() : null}
      {group === "all" || group === "scenario" ? renderScenarioTags() : null}
    </div>
  );
}
