import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { format, parseISO } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2 } from "lucide-react";
import { 
  useGetEntry, 
  useUpdateEntry, 
  useDeleteEntry, 
  getGetEntryQueryKey,
  Mood 
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { invalidateAllQueries } from "@/hooks/use-invalidate";
import { MoodPicker } from "@/components/ui/MoodPicker";
import { TagInput } from "@/components/ui/TagInput";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MOOD_COLORS } from "@/lib/mood";

export default function EntryDetailPage() {
  const [, params] = useRoute("/entries/:id");
  const id = params?.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entry, isLoading } = useGetEntry(id || "", {
    query: { enabled: !!id, queryKey: getGetEntryQueryKey(id || "") }
  });

  const updateEntry = useUpdateEntry();
  const deleteEntry = useDeleteEntry();

  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood>("neutral");
  const [tags, setTags] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const initRef = useRef<string | null>(null);

  useEffect(() => {
    if (entry && initRef.current !== entry.id) {
      initRef.current = entry.id;
      setContent(entry.content);
      setMood(entry.mood);
      setTags(entry.tags);
    }
  }, [entry]);

  const handleSave = async () => {
    if (!id) return;
    try {
      await updateEntry.mutateAsync({
        id,
        data: { content, mood, tags }
      });
      invalidateAllQueries(queryClient);
      setIsEditing(false);
      toast({ title: "Entry updated" });
    } catch (error) {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteEntry.mutateAsync({ id });
      invalidateAllQueries(queryClient);
      toast({ title: "Entry removed" });
      setLocation("/journal");
    } catch (error) {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  if (isLoading || !entry) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 pt-12 px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <time className="text-sm text-muted-foreground tracking-widest uppercase font-medium">
              {format(parseISO(entry.entryDate), "MMMM d, yyyy")}
            </time>

            {!isEditing && (
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete entry?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove this star from your sky. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-8 animate-in fade-in">
              <div className="space-y-3">
                <MoodPicker value={mood} onChange={setMood} />
              </div>
              
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px] text-lg bg-card/50 border-border/50 resize-none leading-relaxed"
              />

              <div className="space-y-3">
                <label className="text-sm text-muted-foreground uppercase tracking-widest font-medium">Tags</label>
                <TagInput value={tags} onChange={setTags} />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={() => {
                  setIsEditing(false);
                  setContent(entry.content);
                  setMood(entry.mood);
                  setTags(entry.tags);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={updateEntry.isPending}>
                  {updateEntry.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-12 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ 
                    backgroundColor: MOOD_COLORS[entry.mood],
                    boxShadow: `0 0 10px ${MOOD_COLORS[entry.mood]}`
                  }}
                />
                <span className="capitalize text-sm font-medium tracking-wide text-muted-foreground">
                  {entry.mood}
                </span>
              </div>
              
              <p className="text-xl leading-relaxed text-foreground whitespace-pre-wrap font-serif">
                {entry.content}
              </p>

              {entry.tags.length > 0 && (
                <div className="flex gap-2 pt-8 border-t border-border/50">
                  {entry.tags.map(tag => (
                    <span key={tag} className="text-sm px-3 py-1 rounded-full bg-secondary/50 text-secondary-foreground border border-border/50">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
