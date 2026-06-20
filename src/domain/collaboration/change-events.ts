import { CreateMemberInput, UpdateMemberInput } from '@/types/member';

export type ChangeEventType = 
  | 'ADD_MEMBER'
  | 'UPDATE_MEMBER'
  | 'DELETE_MEMBER'
  | 'ADD_RELATIONSHIP'
  | 'REMOVE_RELATIONSHIP'
  | 'MOVE_NODE';

export interface BaseChangeEvent {
  id: string; // Event ID
  treeId: string;
  versionId: string; // The base version this change is proposed against
  userId: string;
  timestamp: string;
}

export interface AddMemberEvent extends BaseChangeEvent {
  type: 'ADD_MEMBER';
  payload: {
    member: CreateMemberInput;
    temporaryId: string; // Used to resolve relationships before actual DB id is assigned
  };
}

export interface UpdateMemberEvent extends BaseChangeEvent {
  type: 'UPDATE_MEMBER';
  payload: {
    memberId: string;
    changes: UpdateMemberInput;
  };
}

export interface DeleteMemberEvent extends BaseChangeEvent {
  type: 'DELETE_MEMBER';
  payload: {
    memberId: string;
  };
}

export interface AddRelationshipEvent extends BaseChangeEvent {
  type: 'ADD_RELATIONSHIP';
  payload: {
    type: 'PARENT' | 'SPOUSE';
    fromId: string; // Can be a temporaryId from ADD_MEMBER
    toId: string;   // Can be a temporaryId from ADD_MEMBER
  };
}

export interface RemoveRelationshipEvent extends BaseChangeEvent {
  type: 'REMOVE_RELATIONSHIP';
  payload: {
    type: 'PARENT' | 'SPOUSE';
    fromId: string;
    toId: string;
  };
}

export interface MoveNodeEvent extends BaseChangeEvent {
  type: 'MOVE_NODE';
  payload: {
    memberId: string;
    x: number;
    y: number;
  };
}

export type ChangeEvent = 
  | AddMemberEvent
  | UpdateMemberEvent
  | DeleteMemberEvent
  | AddRelationshipEvent
  | RemoveRelationshipEvent
  | MoveNodeEvent;
