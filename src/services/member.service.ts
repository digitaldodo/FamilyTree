// Member Service (Client-Side)
// HTTP client for member CRUD operations

import type {
  Member,
  CreateMemberInput,
  UpdateMemberInput,
  MemberWithRelations,
} from '@/types/member';
import type { ApiResponse, ApiListResponse } from '@/types/api';
import { API_ROUTES } from '@/utils/constants';

/** Fetch all members with optional pagination */
export async function getMembers(
  page = 1,
  limit = 10,
): Promise<ApiListResponse<Member>> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const res = await fetch(`${API_ROUTES.MEMBERS}?${params}`);
  if (!res.ok) throw new Error('Failed to fetch members');
  let data;
      try {
      data = await res.json();
    } catch {
      throw new Error("Server returned invalid response");
    }
      return data;
}

/** Fetch a single member by ID with relationships */
export async function getMemberById(
  id: string,
): Promise<ApiResponse<MemberWithRelations>> {
  const res = await fetch(`${API_ROUTES.MEMBERS}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch member');
  let data;
      try {
      data = await res.json();
    } catch {
      throw new Error("Server returned invalid response");
    }
      return data;
}

/** Create a new member */
export async function createMember(
  input: CreateMemberInput,
): Promise<ApiResponse<Member>> {
  const res = await fetch(API_ROUTES.MEMBERS, {
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
    throw new Error(err.message || 'Failed to create member');
  }
  let data;
      try {
      data = await res.json();
    } catch {
      throw new Error("Server returned invalid response");
    }
      return data;
}

/** Update an existing member */
export async function updateMember(
  id: string,
  input: UpdateMemberInput,
): Promise<ApiResponse<Member>> {
  const res = await fetch(`${API_ROUTES.MEMBERS}/${id}`, {
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
    throw new Error(err.message || 'Failed to update member');
  }
  let data;
      try {
      data = await res.json();
    } catch {
      throw new Error("Server returned invalid response");
    }
      return data;
}

/** Delete a member */
export async function deleteMember(id: string): Promise<void> {
  const res = await fetch(`${API_ROUTES.MEMBERS}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete member');
}
