// Tree Service (Client-Side)
// HTTP client for tree CRUD operations

import type {
  Tree,
  CreateTreeInput,
  UpdateTreeInput,
  TreeWithMembers,
} from '@/types/tree';
import type { ApiResponse, ApiListResponse } from '@/types/api';
import { API_ROUTES } from '@/utils/constants';

/** Fetch all trees with optional pagination */
export async function getTrees(
  page = 1,
  limit = 10,
): Promise<ApiListResponse<Tree>> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const res = await fetch(`${API_ROUTES.TREES}?${params}`);
  if (!res.ok) throw new Error('Failed to fetch trees');
  let data;
      try {
      data = await res.json();
    } catch {
      throw new Error("Server returned invalid response");
    }
      return data;
}

/** Fetch a single tree by ID with all members and relationships */
export async function getTreeById(
  id: string,
): Promise<ApiResponse<TreeWithMembers>> {
  const res = await fetch(`${API_ROUTES.TREES}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch tree');
  let data;
      try {
      data = await res.json();
    } catch {
      throw new Error("Server returned invalid response");
    }
      return data;
}

/** Create a new tree */
export async function createTree(
  input: CreateTreeInput,
): Promise<ApiResponse<Tree>> {
  const res = await fetch(API_ROUTES.TREES, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    let err;
    try {
      err = await res.json();
    } catch {
      throw new Error("Server returned invalid response");
    }
    throw new Error(err.message || 'Failed to create tree');
  }
  let data;
      try {
      data = await res.json();
    } catch {
      throw new Error("Server returned invalid response");
    }
      return data;
}

/** Update a tree */
export async function updateTree(
  id: string,
  input: UpdateTreeInput,
): Promise<ApiResponse<Tree>> {
  const res = await fetch(`${API_ROUTES.TREES}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    let err;
    try {
      err = await res.json();
    } catch {
      throw new Error("Server returned invalid response");
    }
    throw new Error(err.message || 'Failed to update tree');
  }
  let data;
      try {
      data = await res.json();
    } catch {
      throw new Error("Server returned invalid response");
    }
      return data;
}

/** Delete a tree and all its members */
export async function deleteTree(id: string): Promise<void> {
  const res = await fetch(`${API_ROUTES.TREES}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete tree');
}
