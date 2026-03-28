"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Question {
  slug: string;
  title: string;
  category: string;
  roles: string[];
  zones: string[];
  difficulty: string;
  tags: string[];
  excerpt?: string;
}

interface SearchResult {
  question: Question;
  score: number;
  highlights: {
    title?: string;
    content?: string;
  };
}

interface FilterOptions {
  categories: Record<string, { name: string; icon: string }>;
  roles: Record<string, { name: string; icon: string }>;
  zones: Record<string, { name: string; icon: string }>;
  difficulties: Record<string, { label: string; name: string }>;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    role: "",
    zone: "",
    difficulty: "",
  });
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // 从 URL 参数初始化
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      performSearch(q, {
        category: searchParams.get("category") || "",
        role: searchParams.get("role") || "",
        zone: searchParams.get("zone") || "",
        difficulty: searchParams.get("difficulty") || "",
      });
    }
    loadFilterOptions();
  }, [searchParams]);

  // 加载筛选选项
  const loadFilterOptions = async () => {
    try {
      const response = await fetch("/api/search?page=1&limit=1");
      const data = await response.json();
      if (data.success) {
        setFilterOptions(data.data.filters.available);
      }
    } catch (error) {
      console.error("Failed to load filter options:", error);
    }
  };

  // 执行搜索
  const performSearch = useCallback(async (searchQuery: string, additionalFilters = {}) => {
    if (!searchQuery && !Object.values(additionalFilters).some(Boolean)) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (additionalFilters.category) params.set("category", additionalFilters.category);
      if (additionalFilters.role) params.set("role", additionalFilters.role);
      if (additionalFilters.zone) params.set("zone", additionalFilters.zone);
      if (additionalFilters.difficulty) params.set("difficulty", additionalFilters.difficulty);
      params.set("page", "1");
      params.set("limit", "20");

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.data.results);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 处理搜索提交
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filters.category) params.set("category", filters.category);
    if (filters.role) params.set("role", filters.role);
    if (filters.zone) params.set("zone", filters.zone);
    if (filters.difficulty) params.set("difficulty", filters.difficulty);
    
    router.push(`/search?${params}`);
    performSearch(query, filters);
  };

  // 处理筛选变化
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (newFilters.category) params.set("category", newFilters.category);
    if (newFilters.role) params.set("role", newFilters.role);
    if (newFilters.zone) params.set("zone", newFilters.zone);
    if (newFilters.difficulty) params.set("difficulty", newFilters.difficulty);
    
    router.push(`/search?${params}`);
    performSearch(query, newFilters);
  };

  // 清除筛选
  const clearFilters = () => {
    setFilters({ category: "", role: "", zone: "", difficulty: "" });
    router.push("/search");
    if (query) {
      performSearch(query, {});
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          ← 返回首页
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-8">搜索题目</h1>

        {/* 搜索框 */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索题目、关键词、标签..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              搜索
            </button>
          </div>
        </form>

        {/* 筛选器 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">筛选条件</h2>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              清除筛选
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 分类筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                技术分类
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部分类</option>
                {filterOptions?.categories &&
                  Object.entries(filterOptions.categories).map(([key, cat]: [string, any]) => (
                    <option key={key} value={key}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* 岗位筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                岗位角色
              </label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange("role", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部岗位</option>
                {filterOptions?.roles &&
                  Object.entries(filterOptions.roles).map(([key, role]: [string, any]) => (
                    <option key={key} value={key}>
                      {role.icon} {role.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* 技术专区筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                技术专区
              </label>
              <select
                value={filters.zone}
                onChange={(e) => handleFilterChange("zone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部专区</option>
                {filterOptions?.zones &&
                  Object.entries(filterOptions.zones).map(([key, zone]: [string, any]) => (
                    <option key={key} value={key}>
                      {zone.icon} {zone.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* 难度筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                难度级别
              </label>
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange("difficulty", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部难度</option>
                {filterOptions?.difficulties &&
                  Object.entries(filterOptions.difficulties).map(([key, diff]: [string, any]) => (
                    <option key={key} value={diff.label}>
                      {diff.label} {diff.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* 搜索结果 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">搜索中...</p>
          </div>
        ) : results.length > 0 ? (
          <div>
            <div className="mb-4 text-gray-600">
              找到 {pagination.total} 道题目
            </div>
            <div className="space-y-4">
              {results.map(({ question, highlights }) => (
                <Link
                  key={question.slug}
                  href={`/questions/${question.slug}`}
                  className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3
                      className="text-xl font-semibold text-gray-900"
                      dangerouslySetInnerHTML={{ __html: highlights.title || question.title }}
                    />
                    <span className="text-sm text-gray-500">{question.difficulty}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {question.category}
                    </span>
                    {question.roles.slice(0, 2).map((role) => (
                      <span key={role} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        {role}
                      </span>
                    ))}
                    {question.zones.slice(0, 2).map((zone) => (
                      <span key={zone} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                        {zone}
                      </span>
                    ))}
                  </div>

                  {highlights.content && (
                    <p
                      className="text-gray-600 text-sm"
                      dangerouslySetInnerHTML={{ __html: highlights.content }}
                    />
                  )}

                  {!highlights.content && question.excerpt && (
                    <p className="text-gray-600 text-sm">{question.excerpt}</p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-3">
                    {question.tags.slice(0, 5).map((tag) => (
                      <span key={tag} className="text-xs text-gray-500">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>

            {/* 分页 */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (query) params.set("q", query);
                      if (filters.category) params.set("category", filters.category);
                      if (filters.role) params.set("role", filters.role);
                      if (filters.zone) params.set("zone", filters.zone);
                      if (filters.difficulty) params.set("difficulty", filters.difficulty);
                      params.set("page", page.toString());
                      router.push(`/search?${params}`);
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      page === pagination.page
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : query || Object.values(filters).some(Boolean) ? (
          <div className="text-center py-12">
            <p className="text-gray-600">未找到匹配的题目</p>
            <p className="text-sm text-gray-500 mt-2">尝试调整搜索词或筛选条件</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">输入关键词开始搜索</p>
            <p className="text-sm text-gray-500 mt-2">或选择筛选条件浏览题目</p>
          </div>
        )}
      </div>
    </div>
  );
}
