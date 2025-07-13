"use client";

import { usePlaybackStore } from "@/stores/playback-store";

export function TimelineTimeDisplay() {
  const { currentTime, duration } = usePlaybackStore();

  return (
    <div
      className="text-xs text-muted-foreground font-mono px-2"
      style={{ minWidth: "18ch", textAlign: "center" }}
    >
      {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
    </div>
  );
}