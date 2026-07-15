export type Author = 'bryan' | 'adela';
export type MemoryType = 'photo' | 'milestone';

export interface PhotoDTO {
  id: string;
  url: string;
  order: number;
}

export interface MemoryDTO {
  id: string;
  author: Author;
  type: MemoryType;
  title: string;
  body: string | null;
  date: string;
  emoji: string | null;
  location: string | null;
  createdAt: string;
  photos: PhotoDTO[];
  commentCount: number;
  photoCount: number;
}

export interface CommentDTO {
  id: string;
  memoryId: string;
  author: Author;
  body: string;
  createdAt: string;
}
