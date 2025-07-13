"use client";

import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Scissors,
  ArrowLeftToLine,
  ArrowRightToLine,
  Trash2,
  Snowflake,
  Copy,
  SplitSquareHorizontal,
  Pause,
  Play,
} from "lucide-react";
import { usePlaybackStore } from "@/stores/playback-store";
import { useTimelineStore } from "@/stores/timeline-store";

interface TimelineToolbarProps {
  onSplitSelected: () => void;
  onSplitAndKeepLeft: () => void;
  onSplitAndKeepRight: () => void;
  onSeparateAudio: () => void;
  onDuplicateSelected: () => void;
  onDeleteSelected: () => void;
  onAddTestClip: () => void;
  showTestClipButton: boolean;
}

export function TimelineToolbar({
  onSplitSelected,
  onSplitAndKeepLeft,
  onSplitAndKeepRight,
  onSeparateAudio,
  onDuplicateSelected,
  onDeleteSelected,
  onAddTestClip,
  showTestClipButton,
}: TimelineToolbarProps) {
  const { isPlaying, toggle } = usePlaybackStore();
  const { selectedElements } = useTimelineStore();

  const hasSelection = selectedElements.length > 0;

  return (
    <div className="border-b flex items-center px-2 py-1 gap-1">
      <Tooltip delayDuration={500}>
        {/* Play/Pause Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="text"
              size="icon"
              onClick={toggle}
              className="mr-2"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isPlaying ? "Pause (Space)" : "Play (Space)"}
          </TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Test Clip Button - for debugging */}
        {showTestClipButton && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddTestClip}
                  className="text-xs"
                >
                  Add Test Clip
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add a test clip to try playback</TooltipContent>
            </Tooltip>
            <div className="w-px h-6 bg-border mx-1" />
          </>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="text" 
              size="icon" 
              onClick={onSplitSelected}
              disabled={!hasSelection}
            >
              <Scissors className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Split element (Ctrl+S)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="text"
              size="icon"
              onClick={onSplitAndKeepLeft}
              disabled={!hasSelection}
            >
              <ArrowLeftToLine className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Split and keep left (Ctrl+Q)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="text"
              size="icon"
              onClick={onSplitAndKeepRight}
              disabled={!hasSelection}
            >
              <ArrowRightToLine className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Split and keep right (Ctrl+W)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="text" 
              size="icon" 
              onClick={onSeparateAudio}
              disabled={!hasSelection}
            >
              <SplitSquareHorizontal className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Separate audio (Ctrl+D)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="text"
              size="icon"
              onClick={onDuplicateSelected}
              disabled={!hasSelection}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Duplicate element (Ctrl+D)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="text"
              size="icon"
              onClick={onDeleteSelected}
              disabled={!hasSelection}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete element (Delete)</TooltipContent>
        </Tooltip>
      </Tooltip>
    </div>
  );
}
