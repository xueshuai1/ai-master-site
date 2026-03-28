"use client";

import { useState, useMemo } from "react";
import Tag from "./Tag";
import tagsData from "@/content/meta/tags.json";

interface TagFilterProps {
  onFilterChange?: (filters: TagFilters) => void;
  compact?: boolean;
}

interface TagFilters {
  techDomains: string[];
  difficulties: string[];
  scenarios: string[];
}

export default function TagFilter({ onFilterChange, compact = false }: TagFilterProps) {
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string[]>([]);

  const tags = tagsData as any;

  const handleTechToggle = (tagId: string) => {
    const newSelection = selectedTech.includes(tagId)
      ? selectedTech.filter((t) => t !== tagId)
      : [...selectedTech, tagId];
    setSelectedTech(newSelection);
    updateFilters(newSelection, selectedDifficulty, selectedScenario);
  };

  const handleDifficultyToggle = (tagId: string) => {
    const newSelection = selectedDifficulty.includes(tagId)
      ? selectedDifficulty.filter((t) => t !== tagId)
      : [...selectedDifficulty, tagId];
    setSelectedDifficulty(newSelection);
    updateFilters(selectedTech, newSelection, selectedScenario);
  };

  const handleScenarioToggle = (tagId: string) => {
    const newSelection = selectedScenario.includes(tagId)
      ? selectedScenario.filter((t) => t !== tagId)
      : [...selectedScenario, tagId];
    setSelectedScenario(newSelection);
    updateFilters(selectedTech, selectedDifficulty, newSelection);
  };

  const updateFilters = (tech: string[], diff: string[], scenario: string[]) => {
    if (onFilterChange) {
      onFilterChange({
        techDomains: tech,
        difficulties: diff,
        scenarios: scenario,
      });
    }
  };

  const clearAll = () => {
    setSelectedTech([]);
    setSelectedDifficulty([]);
    setSelectedScenario([]);
    updateFilters([], [], []);
  };

  const hasActiveFilters = selectedTech.length > 0 || selectedDifficulty.length > 0 || selectedScenario.length > 0;

  return (
    <div className="space-y-4">
      {/* 技术领域 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">技术领域</h3>
        <div className="flex flex-wrap gap-2">
          {tags.tagGroups.find((g: any) => g.id === "tech")?.tags.map((tagId: string) => {
            const tag = tags.techDomains[tagId as keyof typeof tags.techDomains];
            return (
              <Tag
                key={tagId}
                id={tagId}
                name={tag.name}
                icon={tag.icon}
                group="tech"
                size={compact ? "sm" : "md"}
                active={selectedTech.includes(tagId)}
                onClick={() => handleTechToggle(tagId)}
              />
            );
          })}
        </div>
      </div>

      {/* 难度等级 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">难度等级</h3>
        <div className="flex flex-wrap gap-2">
          {tags.tagGroups.find((g: any) => g.id === "difficulty")?.tags.map((tagId: string) => {
            const tag = tags.difficulties[tagId as keyof typeof tags.difficulties];
            return (
              <Tag
                key={tagId}
                id={tagId}
                name={tag.name}
                icon={tag.icon}
                group="difficulty"
                size={compact ? "sm" : "md"}
                active={selectedDifficulty.includes(tagId)}
                onClick={() => handleDifficultyToggle(tagId)}
              />
            );
          })}
        </div>
      </div>

      {/* 应用场景 */}
      {!compact && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">应用场景</h3>
          <div className="flex flex-wrap gap-2">
            {tags.tagGroups.find((g: any) => g.id === "scenario")?.tags.map((tagId: string) => {
              const tag = tags.scenarios[tagId as keyof typeof tags.scenarios];
              return (
                <Tag
                  key={tagId}
                  id={tagId}
                  name={tag.name}
                  icon={tag.icon}
                  group="scenario"
                  size={compact ? "sm" : "md"}
                  active={selectedScenario.includes(tagId)}
                  onClick={() => handleScenarioToggle(tagId)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 清除筛选 */}
      {hasActiveFilters && (
        <div className="pt-2 border-t border-gray-200">
          <button
            onClick={clearAll}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            清除所有筛选
          </button>
        </div>
      )}
    </div>
  );
}
