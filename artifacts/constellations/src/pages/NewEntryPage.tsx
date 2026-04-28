import { useState } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateEntry, Mood } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { invalidateAllQueries } from "@/hooks/use-invalidate";
import { MoodPicker } from "@/components/ui/MoodPicker";
import { TagInput } from "@/components/ui/TagInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NewEntryPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createEntry = useCreateEntry();

  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood>("neutral");
  const [tags, setTags] = useState<string[]>([]);
  const [entryDate, setEntryDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({ title: "Content is required", variant: "destructive" });
      return;
    }

    try {
      await createEntry.mutateAsync({
        data: {
          content,
          mood,
          tags,
          entryDate,
        }
      });

      invalidateAllQueries(queryClient);
      
      toast({
        title: "Star ignited",
        description: "Your reflection has been added to the sky.",
      });
      
      setLocation("/");
    } catch (error) {
      toast({
        title: "Failed to create entry",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32 pt-12 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-serif mb-8 text-foreground">New Reflection</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-sm text-muted-foreground uppercase tracking-widest font-medium">How are you feeling?</label>
            <MoodPicker value={mood} onChange={setMood} />
          </div>

          <div className="space-y-3">
            <label htmlFor="content" className="text-sm text-muted-foreground uppercase tracking-widest font-medium">Your thoughts</label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[250px] text-lg bg-card/50 border-border/50 focus-visible:ring-1 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground uppercase tracking-widest font-medium">Tags</label>
              <TagInput value={tags} onChange={setTags} />
            </div>

            <div className="space-y-3">
              <label htmlFor="date" className="text-sm text-muted-foreground uppercase tracking-widest font-medium">Date</label>
              <Input
                id="date"
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="bg-transparent"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              size="lg" 
              disabled={createEntry.isPending || !content.trim()}
              className="rounded-full px-8"
            >
              {createEntry.isPending ? "Igniting..." : "Add to Sky"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
