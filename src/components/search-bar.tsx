"use client"

import useThread from "@/hooks/use-thread";
import { cn } from "@/lib/utils";
import { atom, useAtom } from "jotai";
import { Loader2 } from "lucide-react";

export const searchValueAtom = atom('');
export const isSearchAtom = atom(false);

const SearchBar = () => {
    const [searchValue, setSearchValue] = useAtom(searchValueAtom);
    const [isSearching, setIsSearching] = useAtom(isSearchAtom);
    
    const { isFetching } = useThread();
    const hasSearchValue = searchValue.length > 0;

    const handleBlur = () => {
        if (searchValue !== '') {
            return;
        }
        setIsSearching(false);
    }
    return (
        <div className="px-6 py-3 border-b bg-muted/30">
            <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-primary/5 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity blur-xl" />

                <input
                    type="search"
                    placeholder="Search emails..."
                    className={cn(
                        "relative w-full pl-10 pr-10 py-2.5 rounded-lg border bg-background/80 backdrop-blur-sm text-sm",
                        "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all",
                        "placeholder:text-muted-foreground/60"
                    )}
                    value={searchValue}
                    onFocus={() => setIsSearching(true)}
                    onBlur={() => handleBlur()}
                    onChange={(e) => setSearchValue(e.target.value)}
                />

                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {isFetching && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    
                    {hasSearchValue && !isFetching && (
                        <button
                            className="rounded-full p-1 hover:bg-muted transition-colors"
                            onClick={() => setSearchValue('')}
                            aria-label="Clear search"
                        >
                            {/* <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" /> */}
                        </button>
                    )}
                </div>
            </div>

            {hasSearchValue && (
                <div className="mt-2 text-xs text-muted-foreground">
                    Searching for &quot;{searchValue}&quot;
                </div>
            )}
        </div>
    )
}

export default SearchBar