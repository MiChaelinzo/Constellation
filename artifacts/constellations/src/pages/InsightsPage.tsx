import { useGetInsights, getGetInsightsQueryKey } from "@workspace/api-client-react";
import { MOOD_COLORS, MOOD_LABELS } from "@/lib/mood";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from "recharts";
import { Flame, Star, CalendarDays, Award } from "lucide-react";

export default function InsightsPage() {
  const { data, isLoading } = useGetInsights({
    query: { queryKey: getGetInsightsQueryKey() }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
      </div>
    );
  }

  if (!data) return null;

  const pieData = data.moodCounts
    .filter(m => m.count > 0)
    .map(m => ({
      name: MOOD_LABELS[m.mood],
      value: m.count,
      color: MOOD_COLORS[m.mood]
    }));

  const barData = data.perMonth.map(m => ({
    name: m.month,
    count: m.count
  })).reverse(); // Assuming API might not sort chronologically, but usually we want oldest to newest or left to right

  return (
    <div className="min-h-screen bg-background pb-32 pt-12 px-6">
      <div className="max-w-5xl mx-auto space-y-12">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Insights</h1>
          <p className="text-muted-foreground mt-2">Patterns in your sky</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            icon={Star} 
            label="Total Entries" 
            value={data.totalEntries} 
            color="text-yellow-400"
          />
          <StatCard 
            icon={Flame} 
            label="Current Streak" 
            value={`${data.currentStreak} days`} 
            color="text-orange-500"
          />
          <StatCard 
            icon={Award} 
            label="Longest Streak" 
            value={`${data.longestStreak} days`} 
            color="text-primary"
          />
          <StatCard 
            icon={CalendarDays} 
            label="Days Journaled" 
            value={data.daysJournaled} 
            color="text-blue-400"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mood Distribution */}
          <div className="bg-card border border-border/50 rounded-2xl p-6">
            <h3 className="text-lg font-medium mb-6">Mood Distribution</h3>
            <div className="h-[300px]">
              {pieData.length > 0 ? (
                <div className="h-full flex items-center gap-8">
                  <ResponsiveContainer width="60%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                        isAnimationActive={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-3">
                    {pieData.map((m) => (
                      <div key={m.name} className="flex items-center gap-3 text-sm">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: m.color, boxShadow: `0 0 8px ${m.color}` }}
                        />
                        <span className="flex-1 text-foreground">{m.name}</span>
                        <span className="text-muted-foreground">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground italic">
                  Not enough data yet
                </div>
              )}
            </div>
          </div>

          {/* Top Tags */}
          <div className="bg-card border border-border/50 rounded-2xl p-6">
            <h3 className="text-lg font-medium mb-6">Frequently Used Tags</h3>
            <div className="space-y-4">
              {data.topTags.length > 0 ? (
                data.topTags.map((tag, i) => (
                  <div key={tag.tag} className="flex items-center gap-4">
                    <span className="w-6 text-sm text-muted-foreground">{i + 1}.</span>
                    <div className="flex-1">
                      <div className="h-8 bg-secondary rounded-md overflow-hidden relative">
                        <div 
                          className="absolute top-0 left-0 h-full bg-primary/20"
                          style={{ width: `${(tag.count / data.topTags[0].count) * 100}%` }}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium z-10">
                          #{tag.tag}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-medium">{tag.count}</span>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground italic py-12">
                  No tags used yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Monthly Activity */}
        <div className="bg-card border border-border/50 rounded-2xl p-6">
          <h3 className="text-lg font-medium mb-6">Entries per Month</h3>
          <div className="h-[300px]">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--secondary))' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground italic">
                Not enough data yet
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col gap-4">
      <div className={`p-3 rounded-full bg-secondary w-fit ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-3xl font-serif mb-1">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
