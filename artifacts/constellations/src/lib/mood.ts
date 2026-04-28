import { Mood } from "@workspace/api-client-react";

export const MOOD_COLORS: Record<Mood, string> = {
  radiant: "rgb(253, 224, 71)", // bright yellow
  calm: "rgb(94, 234, 212)", // teal/cyan
  neutral: "rgb(203, 213, 225)", // slate light
  cloudy: "rgb(148, 163, 184)", // slate gray
  stormy: "rgb(167, 139, 250)" // deep purple
};

export const MOOD_LABELS: Record<Mood, string> = {
  radiant: "Radiant",
  calm: "Calm",
  neutral: "Neutral",
  cloudy: "Cloudy",
  stormy: "Stormy"
};
