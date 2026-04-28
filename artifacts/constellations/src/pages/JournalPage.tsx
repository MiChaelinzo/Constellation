import { useEffect, useState } from "react";
import { Link, useSearch } from "wouter";
import { format, parseISO } from "date-fns";
import { Search } from "lucide-react";
import { useListEntries, getListEntriesQueryKey } from "@workspace/api-client-react";
import { MOOD_COLORS } from "@/lib/mood";
import { Input } from "@/components/ui/input";

export default function JournalPage() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);

  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading } = useListEntries(
    { from, to, search: debouncedSearch, limit: 100 },
    { query: { queryKey: getListEntriesQueryKey({ from, to, search: debouncedSearch, limit: 100 }) } }
  );

  return (
    <div className="min-h-screen bg-background pb-32 pt-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-foreground">Journal</h1>
            <p className="text-muted-foreground mt-2">
              {isLoading ? "Reading the stars..." : `${data?.total || 0} entries found`}
            </p>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search entries..."
              className="pl-9 bg-card/50 rounded-full"
            />
          </div>
        </div>

        {from && to && (
          <div className="text-sm text-primary bg-primary/10 px-4 py-2 rounded-full inline-block">
            Viewing {from} to {to}
          </div>
        )}

        <div className="space-y-6">
          {!isLoading && data?.entries.length === 0 && (
            <div className="text-center py-24 text-muted-foreground italic font-serif">
              No entries found.
            </div>
          )}

          {data?.entries.map((entry) => (
            <Link key={entry.id} href={`/entries/${entry.id}`}>
              <div className="group block p-6 rounded-2xl bg-card border border-border/50 hover:border-border transition-colors cursor-pointer relative overflow-hidden">
                <div 
                  className="absolute top-0 left-0 w-1 h-full opacity-50 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: MOOD_COLORS[entry.mood] }}
                />
                
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4">
                  <time className="text-sm text-muted-foreground">
                    {format(parseISO(entry.entryDate), "MMMM d, yyyy")}
                  </time>
                  
                  {entry.tags.length > 0 && (
                    <div className="flex gap-2">
                      {entry.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <p className="text-foreground leading-relaxed whitespace-pre-wrap line-clamp-4">
                  {entry.content}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
