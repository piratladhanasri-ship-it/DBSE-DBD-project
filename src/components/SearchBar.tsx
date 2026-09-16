import React from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import { cn } from '../utils/cn';

export function SearchBar({ value, onChange, placeholder = 'Search auctions, categories or sellers', id = 'search', className }) {
  return (
    <div className={cn('relative', className)}>
      <label htmlFor={id} className="sr-only">
        Search
      </label>
      <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" aria-hidden="true" />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-line bg-white pl-10 pr-10 text-sm text-navy-900 placeholder:text-navy-300 transition-colors duration-150 ease-out focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" />
      
      {value ?
      <button
        type="button"
        onClick={() => onChange('')}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-navy-300 transition-colors duration-150 ease-out hover:bg-navy-50 hover:text-navy-700"
        aria-label="Clear search">
        
          <XIcon className="h-4 w-4" aria-hidden="true" />
        </button> :
      null}
    </div>);

}