"use client";

import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { Document as FlexSearchDocument } from 'flexsearch'; // Use named import for Document type
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import { Search as SearchIcon, X as XIcon } from 'lucide-react';

// Type for the documents stored in search-store.json
interface StoredDoc {
    id: string;    // Corresponds to post.slug
    slug: string;
    title: string;
    excerpt: string;
}

// Type for the search results displayed to the user
interface SearchResultDisplayItem extends StoredDoc {
    score?: number; // Optional: FlexSearch can provide a score
}

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<F>): Promise<ReturnType<F>> =>
        new Promise(resolve => {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(() => resolve(func(...args)), waitFor);
        });
}


const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResultDisplayItem[]>([]);
    const [index, setIndex] = useState<FlexSearchDocument<any, false> | null>(null); // Use imported Document type
    const [docStore, setDocStore] = useState<StoredDoc[] | null>(null);
    const [indexLoaded, setIndexLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchPerformed, setSearchPerformed] = useState(false);

    useEffect(() => {
        if (!isOpen || indexLoaded) return; // Only load once or if modal is open

        async function loadSearchData() {
            try {
                console.log("Attempting to load search index and store...");
                const newIndex = new FlexSearchDocument<any, false>({ // Use imported Document type
                    document: {
                        id: 'id',
                        index: ['title', 'content', 'tags'],
                        // store: false, // Explicitly false, data will come from search-store.json
                    },
                    tokenize: 'forward'
                    // language: 'zh' // Removed due to type error with current FlexSearch version's DocumentOptions
                });

                const storeRes = await fetch('/search/search-store.json');
                if (!storeRes.ok) throw new Error('Failed to load search store.');
                const store = await storeRes.json();
                setDocStore(store);

                // FlexSearch exports multiple files. Common parts: reg, cfg, map, ctx.
                // Check generate-search-index.cjs for actual exported keys if different.
                const indexPartsToLoad = ['cfg', 'ctx', 'map', 'reg' /*, 'info', 'tag' if exported */];

                for (const part of indexPartsToLoad) {
                    const res = await fetch(`/search/search-${part}.json`);
                    if (!res.ok) throw new Error(`Failed to load search index part: ${part}`);
                    const data = await res.text(); // FlexSearch import expects string data
                    if (data) { // Only import if data is not empty
                        newIndex.import(part, data);
                    } else {
                        console.warn(`Search index part ${part} is empty.`);
                    }
                }

                setIndex(newIndex);
                setIndexLoaded(true);
                setError(null);
                console.log("Search index and store loaded successfully.");
            } catch (err) {
                console.error("Error loading search data:", err);
                setError(err instanceof Error ? err.message : 'Failed to load search index.');
                setIndexLoaded(false); // Ensure it's marked as not loaded on error
            }
        }
        loadSearchData();
    }, [isOpen, indexLoaded]); // Re-run if isOpen becomes true and index not yet loaded

    const performSearch = useCallback(() => {
        if (!index || !docStore || !searchQuery.trim()) {
            setSearchResults([]);
            setSearchPerformed(!!searchQuery.trim());
            return;
        }

        // index.search returns an array of IDs or, if options are given, more complex results.
        // For preset: 'document' and with multiple fields indexed, it returns results grouped by field.
        const searchResultsFromIndex = index.search(searchQuery, {
            // limit: 10, // Limit results
            // enrich: false, // Not needed as we use external store
            // suggest: true, // Optional: for spelling suggestions
        });

        const uniqueIds = new Set<string>();
        searchResultsFromIndex.forEach(fieldResult => {
            // fieldResult can be { field: string, result: string[] }
            if (fieldResult && Array.isArray(fieldResult.result)) {
                fieldResult.result.forEach(id => uniqueIds.add(id as string));
            }
        });

        const finalResults = Array.from(uniqueIds)
            .map(id => docStore.find(doc => doc.id === id))
            .filter(doc => doc !== undefined) as StoredDoc[];
            // We could add FlexSearch score here if we did more complex result processing

        setSearchResults(finalResults);
        setSearchPerformed(true);
    }, [index, docStore, searchQuery]);

    useEffect(() => {
        if (!indexLoaded || !searchQuery.trim()) {
            setSearchResults([]);
            setSearchPerformed(false);
            return;
        }
        const debouncedSearch = debounce(performSearch, 300);
        debouncedSearch();

        // Cleanup for the debounced function
        return () => {
            // This doesn't strictly cancel a running promise from debounce,
            // but prevents further calls if component unmounts or query changes quickly.
        };
    }, [searchQuery, indexLoaded, performSearch]);

    // Clear search when modal is closed
     useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setSearchResults([]);
            setSearchPerformed(false);
        }
    }, [isOpen]);


    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="mx-auto max-w-xl transform divide-y divide-gray-200 dark:divide-gray-700 overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
                            <div className="relative">
                                <div className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-500">
                                   <SearchIcon aria-hidden="true" />
                                </div>
                                <input
                                    type="text"
                                    className="h-12 w-full border-0 bg-transparent pl-11 pr-10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-0 sm:text-sm"
                                    placeholder="搜索文章..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-3 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                                    onClick={onClose}
                                >
                                    <XIcon className="h-5 w-5" aria-hidden="true" />
                                    <span className="sr-only">Close</span>
                                </button>
                            </div>

                            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                                {!indexLoaded && !error && (
                                    <p className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">正在加载搜索索引...</p>
                                )}
                                {error && (
                                    <p className="p-6 text-center text-sm text-red-600 dark:text-red-400">错误: {error}</p>
                                )}
                                {indexLoaded && !error && searchQuery.trim() && searchResults.length === 0 && searchPerformed && (
                                    <p className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">未找到与 "{searchQuery}" 相关的结果。</p>
                                )}
                                {indexLoaded && !error && !searchQuery.trim() && !searchPerformed && (
                                     <p className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">输入关键词开始搜索。</p>
                                )}

                                {indexLoaded && !error && searchResults.length > 0 && (
                                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {searchResults.map((item) => (
                                            <li key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                <Link href={`/posts/${item.slug}/`} className="block group" onClick={onClose}>
                                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary-light">
                                                        {item.title}
                                                    </h3>
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                                        {item.excerpt}
                                                    </p>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    );
};

export default SearchModal;
