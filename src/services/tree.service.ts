// Tree Service
// Handles all tree-related API calls
// TODO: Implement actual API calls

import { Tree, CreateTreeInput, UpdateTreeInput } from '@/types/tree';
import { ApiResponse, ApiListResponse } from '@/types/api';

const API_BASE = '/api/trees';

export async function getTrees(): Promise<ApiListResponse<Tree>> {
  // TODO: Implement fetch call
  return { data: [], total: 0, page: 1, limit: 10 };
}

export async function getTreeById(id: string): Promise<ApiResponse<Tree | null>> {
  // TODO: Implement fetch call
  return { data: null };
}

export async function createTree(input: CreateTreeInput): Promise<ApiResponse<Tree>> {
  // TODO: Implement fetch call
  return { data: {} as Tree };
}

export async function updateTree(id: string, input: UpdateTreeInput): Promise<ApiResponse<Tree>> {
  // TODO: Implement fetch call
  return { data: {} as Tree };
}

export async function deleteTree(id: string): Promise<void> {
  // TODO: Implement fetch call
}
