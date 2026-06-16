// Member Service
// Handles all member-related API calls
// TODO: Implement actual API calls

import { Member, CreateMemberInput, UpdateMemberInput } from '@/types/member';
import { ApiResponse, ApiListResponse } from '@/types/api';

const API_BASE = '/api/members';

export async function getMembers(): Promise<ApiListResponse<Member>> {
  // TODO: Implement fetch call
  return { data: [], total: 0, page: 1, limit: 10 };
}

export async function getMemberById(id: string): Promise<ApiResponse<Member | null>> {
  // TODO: Implement fetch call
  return { data: null };
}

export async function createMember(input: CreateMemberInput): Promise<ApiResponse<Member>> {
  // TODO: Implement fetch call
  return { data: {} as Member };
}

export async function updateMember(id: string, input: UpdateMemberInput): Promise<ApiResponse<Member>> {
  // TODO: Implement fetch call
  return { data: {} as Member };
}

export async function deleteMember(id: string): Promise<void> {
  // TODO: Implement fetch call
}
