"use client";

import { usePlaybackStore } from "@/stores/playback-store";

/**
 * Displays the current playback time and total duration in seconds with one decimal precision.
 *
 * Shows the values in a monospace, centered format for use in timeline or media controls.
 */
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