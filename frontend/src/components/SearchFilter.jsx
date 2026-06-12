import { memo } from 'react';
import { CATEGORIES, CONDITIONS, SORT_OPTIONS } from '../utils/constants';

function SearchFilter({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  sortBy,
  onSortChange,
  condition,
  onConditionChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
}) {
  return (
    <div className="card bg-white/5 border-white/10 p-5 backdrop-blur-xl">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search Input */}
        <div className="sm:col-span-2">
          <label htmlFor="search" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
            Search
          </label>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              id="search"
              type="text"
              placeholder="Search textbooks, calculators, lab gear..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="input-field bg-white/5 border-white/10 text-white placeholder-gray-500 pl-10 focus:border-violet-500/50"
            />
          </div>
        </div>

        {/* Category Dropdown */}
        <div>
          <label htmlFor="category" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="input-field bg-white/5 border-white/10 text-white focus:border-violet-500/50"
          >
            <option value="" className="bg-slate-900 text-white">All categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-slate-900 text-white">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div>
          <label htmlFor="sort" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
            Sort By
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="input-field bg-white/5 border-white/10 text-white focus:border-violet-500/50"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters Expand Area */}
      <div className="mt-4 pt-4 border-t border-white/5 grid gap-4 sm:grid-cols-3">
        {/* Condition Dropdown */}
        <div>
          <label htmlFor="condition" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
            Condition
          </label>
          <select
            id="condition"
            value={condition}
            onChange={(e) => onConditionChange(e.target.value)}
            className="input-field bg-white/5 border-white/10 text-white focus:border-violet-500/50"
          >
            <option value="" className="bg-slate-900 text-white">All conditions</option>
            {CONDITIONS.map((cond) => (
              <option key={cond} value={cond} className="bg-slate-900 text-white">
                {cond}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price */}
        <div>
          <label htmlFor="minPrice" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
            Min Price (INR)
          </label>
          <input
            id="minPrice"
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className="input-field bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-violet-500/50"
          />
        </div>

        {/* Max Price */}
        <div>
          <label htmlFor="maxPrice" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
            Max Price (INR)
          </label>
          <input
            id="maxPrice"
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className="input-field bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-violet-500/50"
          />
        </div>
      </div>
    </div>
  );
}

export default memo(SearchFilter);
