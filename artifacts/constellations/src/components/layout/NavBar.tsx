import { Link, useLocation } from "wouter";
import { Compass, Plus, Book, Calendar, LineChart } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavBar() {
  const [location] = useLocation();

  const links = [
    { href: "/", icon: Compass, label: "Sky" },
    { href: "/journal", icon: Book, label: "Journal" },
    { href: "/new", icon: Plus, label: "New Entry", primary: true },
    { href: "/calendar", icon: Calendar, label: "Calendar" },
    { href: "/insights", icon: LineChart, label: "Insights" },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-background/80 backdrop-blur-md border shadow-lg px-4 py-2">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = location === link.href;

        return (
          <Link key={link.href} href={link.href}>
            <div
              className={cn(
                "group relative flex items-center justify-center p-3 rounded-full transition-all duration-300 hover:bg-accent",
                isActive ? "text-primary" : "text-muted-foreground",
                link.primary && "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="sr-only">{link.label}</span>
              
              {isActive && !link.primary && (
                <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
