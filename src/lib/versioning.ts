import prisma from './prisma';

export async function createTreeSnapshot(treeId: string, userId: string, name?: string) {
  // Fetch current state
  const [generations, members, relationships] = await Promise.all([
    prisma.generation.findMany({
      where: { treeId },
      orderBy: { orderIndex: 'asc' },
    }),
    prisma.member.findMany({
      where: { treeId },
      orderBy: [{ firstName: 'asc' }],
      include: {
        generation: { select: { id: true, name: true, orderIndex: true } },
        relationsFrom: {
          select: { id: true, type: true, fromId: true, toId: true }
        },
        relationsTo: {
          select: { id: true, type: true, fromId: true, toId: true }
        },
        media: { select: { id: true, url: true, type: true } },
      },
    }),
    prisma.relationship.findMany({
      where: { treeId }
    })
  ]);

  const membersWithRelations = members.map((m: any) => ({
    ...m,
    relationsFrom: Array.isArray(m.relationsFrom) ? m.relationsFrom : [],
    relationsTo: Array.isArray(m.relationsTo) ? m.relationsTo : []
  }));

  return prisma.treeVersion.create({
    data: {
      treeId,
      name: name || null,
      membersData: JSON.stringify(membersWithRelations),
      relationsData: JSON.stringify(relationships),
      gensData: JSON.stringify(generations),
      createdBy: userId,
    },
  });
}
