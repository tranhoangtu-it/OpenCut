import { create } from "zustand";
import { storageService } from "@/lib/storage/storage-service";
import { useTimelineStore } from "./timeline-store";
import { generateUUID } from "@/lib/utils";

export type MediaType = "image" | "video" | "audio";

export interface MediaItem {
  id: string;
  name: string;
  type: MediaType;
  file: File;
  url?: string; // Object URL for preview
  thumbnailUrl?: string; // For video thumbnails
  duration?: number; // For video/audio duration
  width?: number; // For video/image width
  height?: number; // For video/image height
  fps?: number; // For video frame rate
  // Text-specific properties
  content?: string; // Text content
  fontSize?: number; // Font size
  fontFamily?: string; // Font family
  color?: string; // Text color
  backgroundColor?: string; // Background color
  textAlign?: "left" | "center" | "right"; // Text alignment
}

interface MediaStore {
  mediaItems: MediaItem[];
  isLoading: boolean;

  // Actions - now require projectId
  addMediaItem: (
    projectId: string,
    item: Omit<MediaItem, "id">
  ) => Promise<void>;
  removeMediaItem: (projectId: string, id: string) => Promise<void>;
  loadProjectMedia: (projectId: string) => Promise<void>;
  clearProjectMedia: (projectId: string) => Promise<void>;
  clearAllMedia: () => void; // Clear local state only
  cleanupObjectUrls: () => void; // New method to cleanup object URLs
}

// Helper function to determine file type
export const getFileType = (file: File): MediaType | null => {
  const { type } = file;

  if (type.startsWith("image/")) {
    return "image";
  }
  if (type.startsWith("video/")) {
    return "video";
  }
  if (type.startsWith("audio/")) {
    return "audio";
  }

  return null;
};

// Helper function to get image dimensions
export const getImageDimensions = (
  file: File
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();

    img.addEventListener("load", () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      resolve({ width, height });
      img.remove();
    });

    img.addEventListener("error", () => {
      reject(new Error("Could not load image"));
      img.remove();
    });

    img.src = URL.createObjectURL(file);
  });
};

// Helper function to generate video thumbnail and get dimensions
export const generateVideoThumbnail = (
  file: File
): Promise<{ thumbnailUrl: string; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video") as HTMLVideoElement;
    const canvas = document.createElement("canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    video.addEventListener("loadedmetadata", () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Seek to 1 second or 10% of duration, whichever is smaller
      video.currentTime = Math.min(1, video.duration * 0.1);
    });

    video.addEventListener("seeked", () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.8);
      const width = video.videoWidth;
      const height = video.videoHeight;

      resolve({ thumbnailUrl, width, height });

      // Cleanup
      video.remove();
      canvas.remove();
    });

    video.addEventListener("error", () => {
      reject(new Error("Could not load video"));
      video.remove();
      canvas.remove();
    });

    video.src = URL.createObjectURL(file);
    video.load();
  });
};

// Helper function to get media duration
export const getMediaDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const element = document.createElement(
      file.type.startsWith("video/") ? "video" : "audio"
    ) as HTMLVideoElement;

    element.addEventListener("loadedmetadata", () => {
      resolve(element.duration);
      element.remove();
    });

    element.addEventListener("error", () => {
      reject(new Error("Could not load media"));
      element.remove();
    });

    element.src = URL.createObjectURL(file);
    element.load();
  });
};

// Helper to get aspect ratio from MediaItem
export const getMediaAspectRatio = (item: MediaItem): number => {
  if (item.width && item.height) {
    return item.width / item.height;
  }
  return 16 / 9; // Default aspect ratio
};

export const useMediaStore = create<MediaStore>((set, get) => ({
  mediaItems: [],
  isLoading: false,

  addMediaItem: async (projectId, item) => {
    const newItem: MediaItem = {
      ...item,
      id: generateUUID(),
    };

    // Add to local state immediately for UI responsiveness
    set((state) => ({
      mediaItems: [...state.mediaItems, newItem],
    }));

    // Save to persistent storage in background
    try {
      await storageService.saveMediaItem(projectId, newItem);
    } catch (error) {
      console.error("Failed to save media item:", error);
      // Remove from local state if save failed
      set((state) => ({
        mediaItems: state.mediaItems.filter((media) => media.id !== newItem.id),
      }));
      throw error; // Re-throw to let caller handle the error
    }
  },

  removeMediaItem: async (projectId, id: string) => {
    const state = get();
    const item = state.mediaItems.find((media) => media.id === id);

    // Cleanup object URLs to prevent memory leaks
    if (item) {
      if (item.url && item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url);
      }
      if (item.thumbnailUrl && item.thumbnailUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.thumbnailUrl);
      }
    }

    // Remove from local state immediately
    set((state) => ({
      mediaItems: state.mediaItems.filter((media) => media.id !== id),
    }));

    // Remove from persistent storage in background
    try {
      await storageService.deleteMediaItem(projectId, id);
    } catch (error) {
      console.error("Failed to remove media item from storage:", error);
      // Don't re-add to local state as the user expects it to be removed
    }
  },

  loadProjectMedia: async (projectId: string) => {
    set({ isLoading: true });
    try {
      // Cleanup existing object URLs before loading new ones
      get().cleanupObjectUrls();
      
      const mediaItems = await storageService.loadAllMediaItems(projectId);
      set({ mediaItems, isLoading: false });
    } catch (error) {
      console.error("Failed to load project media:", error);
      set({ mediaItems: [], isLoading: false });
    }
  },

  clearProjectMedia: async (projectId: string) => {
    const state = get();
    
    // Cleanup all object URLs
    state.mediaItems.forEach((item) => {
      if (item.url && item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url);
      }
      if (item.thumbnailUrl && item.thumbnailUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.thumbnailUrl);
      }
    });

    set({ mediaItems: [] });

    try {
      await storageService.deleteProjectMedia(projectId);
    } catch (error) {
      console.error("Failed to clear project media from storage:", error);
    }
  },

  clearAllMedia: () => {
    const state = get();
    
    // Cleanup all object URLs
    state.mediaItems.forEach((item) => {
      if (item.url && item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url);
      }
      if (item.thumbnailUrl && item.thumbnailUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.thumbnailUrl);
      }
    });

    set({ mediaItems: [] });
  },

  cleanupObjectUrls: () => {
    const state = get();
    
    // Cleanup all object URLs
    state.mediaItems.forEach((item) => {
      if (item.url && item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url);
      }
      if (item.thumbnailUrl && item.thumbnailUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.thumbnailUrl);
      }
    });
  },
}));
