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
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { ImageUpload } from './image-upload';
import { RelationshipSelector } from './relationship-selector';
import { useAppStore } from '@/store/use-app-store';
import { useGenerations } from '@/hooks/use-generations';

const formSchema = updateMemberSchema.extend({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  generationId: z.string({ required_error: 'Generation is required', invalid_type_error: 'Generation is required' }).min(1, 'Generation is required'),
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
    setError,
    formState: { errors }
  } = useForm<MemberFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: getMemberDefaultValues(member) as any,
  });

  const { activeTreeId, defaultGenerationForNewMember } = useAppStore();
  const { generations, createGeneration } = useGenerations();
  const [status, setStatus] = React.useState<'Alive' | 'Deceased'>(member?.deathDate ? 'Deceased' : 'Alive');

  const avatar = watch('avatar');
  const coverImage = watch('coverImage');

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
    if (status === 'Deceased' && !data.deathDate) {
      setError('deathDate', { type: 'manual', message: 'Death date is required' });
      return;
    }

    // Zod schema already transforms DD-MM-YYYY to ISO strings
    const formattedData = {
      ...data,
      birthDate: data.birthDate || undefined,
      deathDate: status === 'Alive' ? undefined : (data.deathDate || undefined),
      treeId: activeTreeId || undefined,
      generationId: data.generationId || member?.generationId || defaultGenerationForNewMember || undefined,
      relations
    };
    await onSubmit(formattedData);
  };

  const applyDateMask = (val: string) => {
    if (!val) return val;
    const cleaned = val.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,2})(\d{0,2})(\d{0,4})$/);
    if (!match) return val;
    let formatted = '';
    if (match[1]) formatted += match[1];
    if (match[2]) formatted += '-' + match[2];
    if (match[3]) formatted += '-' + match[3];
    return formatted;
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      
      {/* Cover Image Upload */}
      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block text-slate-700 dark:text-slate-300">Cover Image</label>
        <ImageUpload 
          value={coverImage} 
          onChange={(val) => setValue('coverImage', val || undefined)} 
          folder="family-tree/covers"
          isCover
        />
      </div>

      {/* Avatar Upload */}
      <div className="flex flex-col items-center justify-center mb-6">
        <label className="text-sm font-medium mb-2 block text-slate-700 dark:text-slate-300">Profile Photo</label>
        <ImageUpload 
          value={avatar} 
          onChange={(val) => setValue('avatar', val || undefined)} 
          folder="family-tree/avatars"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">First Name</label>
          <Input {...register('firstName')} placeholder="First name" className={errors.firstName ? 'border-destructive' : ''} />
          {errors.firstName && <span className="text-xs text-destructive">{errors.firstName.message}</span>}
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Last Name</label>
          <Input {...register('lastName')} placeholder="Last name" className={errors.lastName ? 'border-destructive' : ''} />
          {errors.lastName && <span className="text-xs text-destructive">{errors.lastName.message}</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Generation</label>
          {generations.length === 0 ? (
            <div className="flex flex-col items-start gap-2 pt-1">
              <span className="text-sm text-muted-foreground">No generations exist yet.</span>
              <Button type="button" variant="outline" size="sm" onClick={() => {
                const name = prompt('Enter first generation name (e.g. Founders):');
                if (name) createGeneration(name);
              }}>
                Create First Generation
              </Button>
            </div>
          ) : (
            <>
              <Controller
                name="generationId"
                control={control}
                defaultValue={member?.generationId || defaultGenerationForNewMember || undefined}
                render={({ field }) => (
                  <Select value={field.value || ""} onValueChange={field.onChange} disabled={field.disabled}>
                    <SelectTrigger className={errors.generationId ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select generation" />
                    </SelectTrigger>
                    <SelectContent>
                      {generations.map((gen) => (
                        <SelectItem key={gen.id} value={gen.id}>
                          {gen.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {!watch('generationId') && !errors.generationId && (
                <span className="text-xs text-muted-foreground mt-1 block">Please select a generation.</span>
              )}
            </>
          )}
          {errors.generationId && <span className="text-xs text-destructive">{errors.generationId?.message as string}</span>}
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Gender</label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select value={field.value || ""} onValueChange={field.onChange} disabled={field.disabled}>
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Status</label>
          <Select value={status} onValueChange={(val: 'Alive' | 'Deceased') => setStatus(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Alive">Alive</SelectItem>
              <SelectItem value="Deceased">Deceased</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Birth Date</label>
          <div className="relative">
            <Input 
              type="text" 
              placeholder="dd-mm-yyyy"
              maxLength={10}
              {...register('birthDate')} 
              onChange={(e) => {
                e.target.value = applyDateMask(e.target.value);
                register('birthDate').onChange(e);
              }}
              className={errors.birthDate ? 'border-destructive pr-10' : 'pr-10'} 
            />
            <div className="absolute right-0 top-0 h-full w-10 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 text-muted-foreground pointer-events-none" />
              <input 
                type="date" 
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={(e) => {
                  if (e.target.value) {
                    const [y, m, d] = e.target.value.split('-');
                    const formatted = `${d}-${m}-${y}`;
                    setValue('birthDate', formatted, { shouldValidate: true, shouldDirty: true });
                  }
                }}
              />
            </div>
          </div>
          {errors.birthDate && <span className="text-xs text-destructive">{errors.birthDate.message}</span>}
        </div>
        {status === 'Deceased' && (
          <div>
            <label className="text-sm font-medium mb-1 block">Death Date</label>
            <div className="relative">
              <Input 
                type="text" 
                placeholder="dd-mm-yyyy"
                maxLength={10}
                {...register('deathDate')} 
                onChange={(e) => {
                  e.target.value = applyDateMask(e.target.value);
                  register('deathDate').onChange(e);
                }}
                className={errors.deathDate ? 'border-destructive pr-10' : 'pr-10'} 
              />
              <div className="absolute right-0 top-0 h-full w-10 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-muted-foreground pointer-events-none" />
                <input 
                  type="date" 
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  onChange={(e) => {
                    if (e.target.value) {
                      const [y, m, d] = e.target.value.split('-');
                      const formatted = `${d}-${m}-${y}`;
                      setValue('deathDate', formatted, { shouldValidate: true, shouldDirty: true });
                    }
                  }}
                />
              </div>
            </div>
            {errors.deathDate && <span className="text-xs text-destructive">{errors.deathDate.message}</span>}
          </div>
        )}
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
        <Button type="submit" disabled={isSubmitting || !watch('generationId')}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {member ? 'Save Changes' : 'Create Member'}
        </Button>
      </div>
    </form>
  );
}
