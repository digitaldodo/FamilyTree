'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateMemberSchema } from '@/validations/member.schema';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getMemberDefaultValues } from '@/utils/form-helpers';
import { MemberWithRelations, UpdateMemberInput, CreateMemberInput } from '@/types/member';
import { Loader2 } from 'lucide-react';
import { ImageUpload } from './image-upload';
import { RelationshipSelector } from './relationship-selector';

const formSchema = updateMemberSchema.extend({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
});

export type MemberFormData = z.infer<typeof formSchema>;

interface MemberFormProps {
  member?: MemberWithRelations;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function MemberForm({ member, onSubmit, onCancel, isSubmitting }: MemberFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors }
  } = useForm<MemberFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: getMemberDefaultValues(member) as any,
  });

  const avatar = watch('avatar');

  // Relationships state
  const [relations, setRelations] = React.useState<{type: 'PARENT' | 'SPOUSE' | 'SIBLING', id: string}[]>(() => {
    if (!member) return [];
    // Initialize with existing relationships
    const existing: {type: 'PARENT' | 'SPOUSE' | 'SIBLING', id: string}[] = [];
    member.relationsFrom.forEach(r => existing.push({ type: r.type, id: r.toId }));
    member.relationsTo.forEach(r => {
      // If someone is related to this member as PARENT, then this member is a child.
      // We store it simply as the original relation structure or manage it conceptually.
      // For simplicity in Phase 4 form, we just map out the direct relationships they have initiated or are part of.
      if (r.type === 'SPOUSE' || r.type === 'SIBLING') {
        existing.push({ type: r.type, id: r.fromId });
      } else if (r.type === 'PARENT') {
        existing.push({ type: 'PARENT', id: r.fromId });
      }
    });
    // Remove duplicates
    return existing.filter((v, i, a) => a.findIndex(t => t.id === v.id && t.type === v.type) === i);
  });

  const handleAddRelation = (id: string, type: 'PARENT' | 'SPOUSE' | 'SIBLING') => {
    setRelations(prev => [...prev, { id, type }]);
  };

  const handleRemoveRelation = (id: string, type: 'PARENT' | 'SPOUSE' | 'SIBLING') => {
    setRelations(prev => prev.filter(r => !(r.id === id && r.type === type)));
  };

  const handleFormSubmit = async (data: MemberFormData) => {
    // Format dates back to ISO strings or undefined if empty
    const formattedData = {
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate).toISOString() : undefined,
      deathDate: data.deathDate ? new Date(data.deathDate).toISOString() : undefined,
      treeId: 'default', // Default tree for now
      relations
    };
    await onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      
      {/* Avatar Upload */}
      <div className="flex justify-center mb-6">
        <ImageUpload 
          value={avatar} 
          onChange={(val) => setValue('avatar', val || '')} 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">First Name</label>
          <Input {...register('firstName')} placeholder="Arthur" className={errors.firstName ? 'border-destructive' : ''} />
          {errors.firstName && <span className="text-xs text-destructive">{errors.firstName.message}</span>}
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Last Name</label>
          <Input {...register('lastName')} placeholder="Pendragon" className={errors.lastName ? 'border-destructive' : ''} />
          {errors.lastName && <span className="text-xs text-destructive">{errors.lastName.message}</span>}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Gender</label>
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={field.disabled}>
              <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.gender && <span className="text-xs text-destructive">{errors.gender.message}</span>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Birth Date</label>
          <Input type="date" {...register('birthDate')} className={errors.birthDate ? 'border-destructive' : ''} />
          {errors.birthDate && <span className="text-xs text-destructive">{errors.birthDate.message}</span>}
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Death Date</label>
          <Input type="date" {...register('deathDate')} className={errors.deathDate ? 'border-destructive' : ''} />
          {errors.deathDate && <span className="text-xs text-destructive">{errors.deathDate.message}</span>}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Biography</label>
        <Textarea {...register('bio')} placeholder="Tell us about this person..." className={errors.bio ? 'border-destructive' : ''} />
        {errors.bio && <span className="text-xs text-destructive">{errors.bio.message}</span>}
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="font-semibold">Relationships</h3>
        <div className="grid grid-cols-1 gap-4">
          <RelationshipSelector
            currentMemberId={member?.id}
            type="PARENT"
            label="Parents"
            existingRelations={relations.filter(r => r.type === 'PARENT').map(r => r.id)}
            onAddRelation={handleAddRelation}
            onRemoveRelation={handleRemoveRelation}
          />
          <RelationshipSelector
            currentMemberId={member?.id}
            type="SPOUSE"
            label="Spouse(s)"
            existingRelations={relations.filter(r => r.type === 'SPOUSE').map(r => r.id)}
            onAddRelation={handleAddRelation}
            onRemoveRelation={handleRemoveRelation}
          />
          <RelationshipSelector
            currentMemberId={member?.id}
            type="SIBLING"
            label="Siblings"
            existingRelations={relations.filter(r => r.type === 'SIBLING').map(r => r.id)}
            onAddRelation={handleAddRelation}
            onRemoveRelation={handleRemoveRelation}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {member ? 'Save Changes' : 'Create Member'}
        </Button>
      </div>
    </form>
  );
}
