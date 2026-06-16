import type { Member, Relationship } from '../generated/prisma/client';

export function calculateTreeMetrics(members: Member[], relationships: Relationship[]) {
  const totalMembers = members.length;
  const relationshipsCount = relationships.length;
  
  // Calculate generations
  const generations = Array.from(new Set(members.map(m => m.generation))).sort((a, b) => a - b);
  const totalGenerations = generations.length;

  // Calculate gender ratio
  const males = members.filter(m => m.gender === 'MALE').length;
  const females = members.filter(m => m.gender === 'FEMALE').length;

  // Generation distribution for charts
  const generationDistribution = generations.map(gen => ({
    generation: `Gen ${gen}`,
    members: members.filter(m => m.generation === gen).length
  }));

  // Find newest members (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newestMembers = members.filter(m => new Date(m.createdAt) > thirtyDaysAgo).length;

  return {
    totalMembers,
    totalGenerations,
    relationshipsCount,
    genderRatio: { males, females },
    generationDistribution,
    newestMembers
  };
}
