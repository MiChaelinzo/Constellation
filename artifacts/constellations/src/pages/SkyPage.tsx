import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useGetSky, useListRecentEntries, getGetSkyQueryKey } from "@workspace/api-client-react";
import { MOOD_COLORS } from "@/lib/mood";

export default function SkyPage() {
  const { data: skyData, isLoading: isLoadingSky } = useGetSky(
    { limit: 1000 },
    { query: { queryKey: getGetSkyQueryKey({ limit: 1000 }) } }
  );

  const { data: recentData } = useListRecentEntries({ limit: 5 });

  const [hoveredStar, setHoveredStar] = useState<string | null>(null);

  if (isLoadingSky) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
      </div>
    );
  }

  const stars = skyData?.stars || [];

  return (
    <div className="relative min-h-screen bg-background overflow-hidden selection:bg-primary/20">
      {/* Deep space background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-background via-background to-black pointer-events-none" />

      {/* Empty State */}
      {stars.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 text-center">
          <p className="text-muted-foreground text-lg mb-6 max-w-md font-serif italic">
            The sky is empty. Write your first entry to ignite a star.
          </p>
          <Link href="/new">
            <span className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:scale-105 transition-transform cursor-pointer shadow-lg shadow-primary/20">
              Begin Journal
            </span>
          </Link>
        </div>
      )}

      {/* Distant ambient field — tiny background dots for depth */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {Array.from({ length: 80 }).map((_, i) => {
          const x = (Math.sin(i * 12.9898) * 43758.5453) % 1;
          const y = (Math.sin(i * 78.233) * 43758.5453) % 1;
          return (
            <div
              key={`bg-${i}`}
              className="absolute rounded-full bg-white/30"
              style={{
                left: `${Math.abs(x) * 100}%`,
                top: `${Math.abs(y) * 100}%`,
                width: "1px",
                height: "1px",
              }}
            />
          );
        })}
      </div>

      {/* The Sky — entry stars */}
      <div className="absolute inset-0 z-0">
        {stars.map((star, idx) => {
          const size = 6 + star.brightness * 8;
          const glow = 18 + star.brightness * 28;
          const color = MOOD_COLORS[star.mood];
          return (
            <Link key={star.id} href={`/entries/${star.id}`}>
              <motion.div
                className="absolute cursor-pointer"
                style={{
                  left: `${star.x * 100}%`,
                  top: `${star.y * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.8,
                  delay: Math.min(0.04 * idx, 1.2),
                  ease: "easeOut",
                }}
                onMouseEnter={() => setHoveredStar(star.id)}
                onMouseLeave={() => setHoveredStar(null)}
              >
                {/* Outer halo */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    left: "50%",
                    top: "50%",
                    width: `${size * 4}px`,
                    height: `${size * 4}px`,
                    transform: "translate(-50%, -50%)",
                    background: `radial-gradient(circle, ${color}55 0%, transparent 70%)`,
                  }}
                  animate={{ opacity: [0.5, 0.9, 0.5] }}
                  transition={{
                    duration: 3 + (idx % 5) * 0.7,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                {/* Star core */}
                <motion.div
                  className="relative rounded-full"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: color,
                    boxShadow: `0 0 ${glow}px ${color}, 0 0 ${glow * 1.6}px ${color}80`,
                  }}
                  animate={{ opacity: [0.85, 1, 0.85], scale: [1, 1.12, 1] }}
                  transition={{
                    duration: 2.4 + (idx % 7) * 0.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Hover Preview */}
                {hoveredStar === star.id && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-4 w-56 p-3 rounded-xl bg-card/90 backdrop-blur-md border border-border/60 shadow-2xl z-50 pointer-events-none">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                      {format(new Date(star.entryDate), "MMM d, yyyy")}
                    </div>
                    <p className="text-sm text-card-foreground line-clamp-3 leading-snug">
                      {star.preview}
                    </p>
                    <div
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-card/90 border-b border-r border-border/60"
                    />
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Ambient Recent Entries Strip */}
      {recentData && recentData.entries.length > 0 && (
        <div className="absolute top-0 left-0 right-0 p-6 z-20 pointer-events-none">
          <div className="max-w-4xl mx-auto flex flex-wrap gap-4 justify-center opacity-40 hover:opacity-100 transition-opacity duration-500">
            {recentData.entries.map((entry) => (
              <Link key={entry.id} href={`/entries/${entry.id}`}>
                <span className="pointer-events-auto text-xs px-3 py-1 rounded-full bg-accent/50 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer truncate max-w-[200px] block">
                  {entry.content}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
