import { useState } from "react";
import { useLocation } from "wouter";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGetCalendar, getGetCalendarQueryKey } from "@workspace/api-client-react";
import { MOOD_COLORS } from "@/lib/mood";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const [, setLocation] = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // API expects 1-12

  const { data, isLoading } = useGetCalendar(
    { year, month },
    { query: { queryKey: getGetCalendarQueryKey({ year, month }) } }
  );

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleDayClick = (dateStr: string) => {
    setLocation(`/journal?from=${dateStr}&to=${dateStr}`);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add empty cells for padding start of month
  const startDayOfWeek = monthStart.getDay();
  const paddingDays = Array.from({ length: startDayOfWeek }).map((_, i) => i);

  return (
    <div className="min-h-screen bg-background pb-32 pt-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-serif text-foreground">Calendar</h1>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-lg font-medium w-40 text-center">
              {format(currentDate, "MMMM yyyy")}
            </span>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-6">
          <div className="grid grid-cols-7 gap-4 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-4">
            {paddingDays.map(i => (
              <div key={`padding-${i}`} className="aspect-square rounded-xl bg-transparent" />
            ))}

            {daysInMonth.map(day => {
              const dateStr = format(day, "yyyy-MM-dd");
              const dayData = data?.days.find(d => d.date === dateStr);
              const hasEntries = dayData && dayData.count > 0;
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={dateStr}
                  onClick={() => hasEntries && handleDayClick(dateStr)}
                  disabled={!hasEntries}
                  className={cn(
                    "aspect-square rounded-xl p-2 relative flex flex-col items-center justify-center transition-all duration-300",
                    hasEntries
                      ? "bg-secondary/60 hover:bg-secondary border border-primary/30 cursor-pointer shadow-[inset_0_0_24px_rgba(255,255,255,0.04)]"
                      : "bg-transparent border border-border/20 opacity-40",
                    isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                >
                  <span className={cn(
                    "text-sm",
                    hasEntries ? "font-medium text-foreground" : "text-muted-foreground"
                  )}>
                    {format(day, "d")}
                  </span>
                  
                  {hasEntries && (
                    <div className="flex gap-1 mt-2">
                      {dayData.moods.slice(0, 3).map((m, i) => (
                        <div 
                          key={`${m}-${i}`}
                          className="w-2 h-2 rounded-full"
                          style={{ 
                            backgroundColor: MOOD_COLORS[m],
                            boxShadow: `0 0 4px ${MOOD_COLORS[m]}`
                          }}
                        />
                      ))}
                      {dayData.moods.length > 3 && (
                        <div className="w-2 h-2 rounded-full bg-muted" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
