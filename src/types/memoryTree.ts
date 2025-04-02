
export interface Memory {
  id: string;
  memoryTreeId: string;
  title: string;
  description: string;
  imageUrl?: string;
  createdAt: string;
  createdBy: string;
}

export interface MemoryTree {
  id: string;
  userId1: string;
  userId2: string;
  createdAt: string;
  branches: MemoryBranch[];
}

export interface MemoryBranch {
  id: string;
  memoryTreeId: string;
  name: string;
  memories: Memory[];
  createdAt: string;
}
