/**
 * Database Seed Script
 * Populates the database with the Gupta family tree data
 *
 * Run with: npx tsx prisma/seed.ts
 */

import { PrismaClient } from '../src/generated/prisma/client';
import { Gender, RelationshipType, Role } from '../src/generated/prisma/enums';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['error'],
});

/** Avatar URL generator using DiceBear */
function avatar(name: string): string {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`;
}

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clean existing data in correct order (respecting foreign keys)
  console.log('🧹 Cleaning existing data...');
  await prisma.relationship.deleteMany();
  await prisma.media.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.member.deleteMany();
  await prisma.tree.deleteMany();
  await prisma.user.deleteMany();
  console.log('   ✓ Existing data cleared\n');

  // ─────────────────────────────────────────────
  // 1. Create Demo User
  // ─────────────────────────────────────────────
  console.log('👤 Creating demo user...');
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@familytree.app',
      name: 'Demo User',
      avatar: avatar('Demo User'),
      role: Role.ADMIN,
    },
  });
  console.log(`   ✓ Created user: ${demoUser.name} (${demoUser.email})\n`);

  // ─────────────────────────────────────────────
  // 2. Create the Gupta Family Tree
  // ─────────────────────────────────────────────
  console.log('🌳 Creating Gupta family tree...');
  const guptaTree = await prisma.tree.create({
    data: {
      name: 'Gupta Family',
      description:
        'The complete family tree of the Gupta family spanning three generations, rooted in traditional Indian values and heritage.',
      isPublic: true,
      ownerId: demoUser.id,
    },
  });
  console.log(`   ✓ Created tree: ${guptaTree.name}\n`);

  // ─────────────────────────────────────────────
  // 3. Create Family Members
  // ─────────────────────────────────────────────
  console.log('👨‍👩‍👧‍👦 Creating family members...');

  const gen0 = await prisma.generation.create({
    data: { name: 'Grandparents', orderIndex: 0, treeId: guptaTree.id }
  });

  const gen1 = await prisma.generation.create({
    data: { name: 'Parents', orderIndex: 1, treeId: guptaTree.id }
  });

  const gen2 = await prisma.generation.create({
    data: { name: 'Children', orderIndex: 2, treeId: guptaTree.id }
  });

  // ── Generation 0: Grandparents ──
  const vinod = await prisma.member.create({
    data: {
      firstName: 'Vinod',
      lastName: 'Gupta',
      gender: Gender.MALE,
      birthDate: new Date('1945-03-15'),
      bio: 'The patriarch of the Gupta family. A retired government officer who dedicated his life to public service and family values. Known for his wisdom and gentle demeanor.',
      imageUrl: avatar('Vinod Gupta'),
      address: 'Civil Lines, Kanpur, Uttar Pradesh',
      occupation: 'Retired Government Officer',
      generationId: gen0.id,
      treeId: guptaTree.id,
    },
  });

  const rp = await prisma.member.create({
    data: {
      firstName: 'RP',
      lastName: 'Gupta',
      gender: Gender.FEMALE,
      birthDate: new Date('1948-07-22'),
      bio: 'The matriarch of the Gupta family. A devoted homemaker and pillar of strength for the entire family. Known for her exceptional cooking and warm hospitality.',
      imageUrl: avatar('RP Gupta'),
      address: 'Civil Lines, Kanpur, Uttar Pradesh',
      occupation: 'Homemaker',
      generationId: gen0.id,
      treeId: guptaTree.id,
    },
  });

  // ── Generation 1: Parents (5 families) ──

  // Family 1: Harsh & Shashi
  const harsh = await prisma.member.create({
    data: {
      firstName: 'Harsh',
      lastName: 'Gupta',
      gender: Gender.MALE,
      birthDate: new Date('1970-01-08'),
      bio: 'Eldest son of Vinod and RP Gupta. A successful businessman with a passion for education and community development.',
      imageUrl: avatar('Harsh Gupta'),
      address: 'Swaroop Nagar, Kanpur, Uttar Pradesh',
      occupation: 'Businessman',
      generationId: gen1.id,
      treeId: guptaTree.id,
    },
  });

  const shashi = await prisma.member.create({
    data: {
      firstName: 'Shashi',
      lastName: 'Gupta',
      gender: Gender.FEMALE,
      birthDate: new Date('1973-04-12'),
      bio: 'Wife of Harsh Gupta. A talented artist and homemaker who brings creativity and warmth to the family.',
      imageUrl: avatar('Shashi Gupta'),
      address: 'Swaroop Nagar, Kanpur, Uttar Pradesh',
      occupation: 'Artist & Homemaker',
      generationId: gen1.id,
      treeId: guptaTree.id,
    },
  });

  // Family 2: Rajesh & Bhavna
  const rajesh = await prisma.member.create({
    data: {
      firstName: 'Rajesh',
      lastName: 'Gupta',
      gender: Gender.MALE,
      birthDate: new Date('1972-06-20'),
      bio: 'Second son of Vinod and RP Gupta. An accomplished engineer who works in the automobile industry.',
      imageUrl: avatar('Rajesh Gupta'),
      address: 'Nehru Nagar, Ghaziabad, Uttar Pradesh',
      occupation: 'Automobile Engineer',
      generationId: gen1.id,
      treeId: guptaTree.id,
    },
  });

  const bhavna = await prisma.member.create({
    data: {
      firstName: 'Bhavna',
      lastName: 'Gupta',
      gender: Gender.FEMALE,
      birthDate: new Date('1975-09-05'),
      bio: 'Wife of Rajesh Gupta. A schoolteacher dedicated to nurturing young minds and shaping the next generation.',
      imageUrl: avatar('Bhavna Gupta'),
      address: 'Nehru Nagar, Ghaziabad, Uttar Pradesh',
      occupation: 'School Teacher',
      generationId: gen1.id,
      treeId: guptaTree.id,
    },
  });

  // Family 3: Parag & Savita
  const parag = await prisma.member.create({
    data: {
      firstName: 'Parag',
      lastName: 'Gupta',
      gender: Gender.MALE,
      birthDate: new Date('1975-11-30'),
      bio: 'Third son of Vinod and RP Gupta. A doctor specializing in cardiology, serving the community through his practice.',
      imageUrl: avatar('Parag Gupta'),
      address: 'Gomti Nagar, Lucknow, Uttar Pradesh',
      occupation: 'Cardiologist',
      generationId: gen1.id,
      treeId: guptaTree.id,
    },
  });

  const savita = await prisma.member.create({
    data: {
      firstName: 'Savita',
      lastName: 'Gupta',
      gender: Gender.FEMALE,
      birthDate: new Date('1978-02-14'),
      bio: 'Wife of Parag Gupta. A pharmacist who runs her own successful pharmacy chain.',
      imageUrl: avatar('Savita Gupta'),
      address: 'Gomti Nagar, Lucknow, Uttar Pradesh',
      occupation: 'Pharmacist',
      generationId: gen1.id,
      treeId: guptaTree.id,
    },
  });

  // Family 4: Vikash & Amita
  const vikash = await prisma.member.create({
    data: {
      firstName: 'Vikash',
      lastName: 'Gupta',
      gender: Gender.MALE,
      birthDate: new Date('1978-08-25'),
      bio: 'Fourth son of Vinod and RP Gupta. A chartered accountant managing finances for several prominent firms.',
      imageUrl: avatar('Vikash Gupta'),
      address: 'Sector 62, Noida, Uttar Pradesh',
      occupation: 'Chartered Accountant',
      generationId: gen1.id,
      treeId: guptaTree.id,
    },
  });

  const amita = await prisma.member.create({
    data: {
      firstName: 'Amita',
      lastName: 'Gupta',
      gender: Gender.FEMALE,
      birthDate: new Date('1981-12-03'),
      bio: 'Wife of Vikash Gupta. A software engineer turned entrepreneur, running a successful EdTech startup.',
      imageUrl: avatar('Amita Gupta'),
      address: 'Sector 62, Noida, Uttar Pradesh',
      occupation: 'EdTech Entrepreneur',
      generationId: gen1.id,
      treeId: guptaTree.id,
    },
  });

  // Family 5: Vishal (unmarried)
  const vishal = await prisma.member.create({
    data: {
      firstName: 'Vishal',
      lastName: 'Gupta',
      gender: Gender.MALE,
      birthDate: new Date('1982-05-18'),
      bio: 'Youngest son of Vinod and RP Gupta. A travel photographer and documentary filmmaker who has explored over 40 countries.',
      imageUrl: avatar('Vishal Gupta'),
      address: 'Defence Colony, New Delhi',
      occupation: 'Travel Photographer & Filmmaker',
      generationId: gen1.id,
      treeId: guptaTree.id,
    },
  });

  // ── Generation 2: Children ──

  // Harsh & Shashi's children
  const garima = await prisma.member.create({
    data: {
      firstName: 'Garima',
      lastName: 'Gupta',
      gender: Gender.FEMALE,
      birthDate: new Date('1996-03-22'),
      bio: 'Eldest daughter of Harsh and Shashi. A data scientist working at a leading tech company in Bangalore.',
      imageUrl: avatar('Garima Gupta'),
      address: 'Koramangala, Bangalore, Karnataka',
      occupation: 'Data Scientist',
      generationId: gen2.id,
      treeId: guptaTree.id,
    },
  });

  const ankur = await prisma.member.create({
    data: {
      firstName: 'Ankur',
      lastName: 'Gupta',
      gender: Gender.MALE,
      birthDate: new Date('1999-08-10'),
      bio: 'Son of Harsh and Shashi. Currently pursuing an MBA from IIM Ahmedabad with specialization in Finance.',
      imageUrl: avatar('Ankur Gupta'),
      address: 'IIM Campus, Ahmedabad, Gujarat',
      occupation: 'MBA Student',
      generationId: gen2.id,
      treeId: guptaTree.id,
    },
  });

  // Rajesh & Bhavna's children
  const swaza = await prisma.member.create({
    data: {
      firstName: 'Swaza',
      lastName: 'Gupta',
      gender: Gender.FEMALE,
      birthDate: new Date('1998-01-15'),
      bio: 'Daughter of Rajesh and Bhavna. A civil services aspirant who is passionate about public policy and governance reform.',
      imageUrl: avatar('Swaza Gupta'),
      address: 'Mukherjee Nagar, New Delhi',
      occupation: 'Civil Services Aspirant',
      generationId: gen2.id,
      treeId: guptaTree.id,
    },
  });

  const tanay = await prisma.member.create({
    data: {
      firstName: 'Tanay',
      lastName: 'Gupta',
      gender: Gender.MALE,
      birthDate: new Date('2001-05-28'),
      bio: 'Son of Rajesh and Bhavna. A computer science engineering student with a keen interest in AI and machine learning.',
      imageUrl: avatar('Tanay Gupta'),
      address: 'IIT Kanpur Campus, Kanpur, Uttar Pradesh',
      occupation: 'Engineering Student',
      generationId: gen2.id,
      treeId: guptaTree.id,
    },
  });

  // Parag & Savita's children
  const sparsh = await prisma.member.create({
    data: {
      firstName: 'Sparsh',
      lastName: 'Gupta',
      gender: Gender.MALE,
      birthDate: new Date('2000-11-02'),
      bio: 'Son of Parag and Savita. A medical student following in his father\'s footsteps, aspiring to become a neurosurgeon.',
      imageUrl: avatar('Sparsh Gupta'),
      address: 'AIIMS Campus, New Delhi',
      occupation: 'Medical Student',
      generationId: gen2.id,
      treeId: guptaTree.id,
    },
  });

  const tanishq = await prisma.member.create({
    data: {
      firstName: 'Tanishq',
      lastName: 'Gupta',
      gender: Gender.MALE,
      birthDate: new Date('2003-07-19'),
      bio: 'Younger son of Parag and Savita. A talented cricketer representing the state U-23 team with dreams of playing for India.',
      imageUrl: avatar('Tanishq Gupta'),
      address: 'Gomti Nagar, Lucknow, Uttar Pradesh',
      occupation: 'Cricketer & Student',
      generationId: gen2.id,
      treeId: guptaTree.id,
    },
  });

  // Vikash & Amita's children
  const ansh = await prisma.member.create({
    data: {
      firstName: 'Ansh',
      lastName: 'Gupta',
      gender: Gender.MALE,
      birthDate: new Date('2002-09-14'),
      bio: 'Son of Vikash and Amita. A full-stack developer and open-source enthusiast, building innovative web applications.',
      imageUrl: avatar('Ansh Gupta'),
      address: 'Sector 62, Noida, Uttar Pradesh',
      occupation: 'Full-Stack Developer',
      generationId: gen2.id,
      treeId: guptaTree.id,
    },
  });

  const avni = await prisma.member.create({
    data: {
      firstName: 'Avni',
      lastName: 'Gupta',
      gender: Gender.FEMALE,
      birthDate: new Date('2005-04-07'),
      bio: 'Daughter of Vikash and Amita. A high school student with exceptional talent in classical dance and painting.',
      imageUrl: avatar('Avni Gupta'),
      address: 'Sector 62, Noida, Uttar Pradesh',
      occupation: 'Student',
      generationId: gen2.id,
      treeId: guptaTree.id,
    },
  });

  console.log('   ✓ Created 19 family members\n');

  // ─────────────────────────────────────────────
  // 4. Create Relationships
  // ─────────────────────────────────────────────
  console.log('🔗 Creating family relationships...');

  const allSons = [harsh, rajesh, parag, vikash, vishal];

  // Grandparent spouse relationship
  await prisma.relationship.create({
    data: { type: RelationshipType.SPOUSE, fromId: vinod.id, toId: rp.id },
  });

  // Parent-child: Vinod & RP → all 5 sons
  for (const son of allSons) {
    await prisma.relationship.create({
      data: { type: RelationshipType.PARENT, fromId: vinod.id, toId: son.id },
    });
    await prisma.relationship.create({
      data: { type: RelationshipType.PARENT, fromId: rp.id, toId: son.id },
    });
  }

  // Sibling relationships among the 5 sons
  for (let i = 0; i < allSons.length; i++) {
    for (let j = i + 1; j < allSons.length; j++) {
      await prisma.relationship.create({
        data: {
          type: RelationshipType.SIBLING,
          fromId: allSons[i].id,
          toId: allSons[j].id,
        },
      });
    }
  }

  // Family 1: Harsh & Shashi → Garima, Ankur
  await prisma.relationship.create({
    data: { type: RelationshipType.SPOUSE, fromId: harsh.id, toId: shashi.id },
  });
  for (const child of [garima, ankur]) {
    await prisma.relationship.create({
      data: { type: RelationshipType.PARENT, fromId: harsh.id, toId: child.id },
    });
    await prisma.relationship.create({
      data: { type: RelationshipType.PARENT, fromId: shashi.id, toId: child.id },
    });
  }
  await prisma.relationship.create({
    data: { type: RelationshipType.SIBLING, fromId: garima.id, toId: ankur.id },
  });

  // Family 2: Rajesh & Bhavna → Swaza, Tanay
  await prisma.relationship.create({
    data: { type: RelationshipType.SPOUSE, fromId: rajesh.id, toId: bhavna.id },
  });
  for (const child of [swaza, tanay]) {
    await prisma.relationship.create({
      data: { type: RelationshipType.PARENT, fromId: rajesh.id, toId: child.id },
    });
    await prisma.relationship.create({
      data: { type: RelationshipType.PARENT, fromId: bhavna.id, toId: child.id },
    });
  }
  await prisma.relationship.create({
    data: { type: RelationshipType.SIBLING, fromId: swaza.id, toId: tanay.id },
  });

  // Family 3: Parag & Savita → Sparsh, Tanishq
  await prisma.relationship.create({
    data: { type: RelationshipType.SPOUSE, fromId: parag.id, toId: savita.id },
  });
  for (const child of [sparsh, tanishq]) {
    await prisma.relationship.create({
      data: { type: RelationshipType.PARENT, fromId: parag.id, toId: child.id },
    });
    await prisma.relationship.create({
      data: { type: RelationshipType.PARENT, fromId: savita.id, toId: child.id },
    });
  }
  await prisma.relationship.create({
    data: { type: RelationshipType.SIBLING, fromId: sparsh.id, toId: tanishq.id },
  });

  // Family 4: Vikash & Amita → Ansh, Avni
  await prisma.relationship.create({
    data: { type: RelationshipType.SPOUSE, fromId: vikash.id, toId: amita.id },
  });
  for (const child of [ansh, avni]) {
    await prisma.relationship.create({
      data: { type: RelationshipType.PARENT, fromId: vikash.id, toId: child.id },
    });
    await prisma.relationship.create({
      data: { type: RelationshipType.PARENT, fromId: amita.id, toId: child.id },
    });
  }
  await prisma.relationship.create({
    data: { type: RelationshipType.SIBLING, fromId: ansh.id, toId: avni.id },
  });

  console.log('   ✓ Created all family relationships\n');

  // ─────────────────────────────────────────────
  // 5. Create Activity Log Entry
  // ─────────────────────────────────────────────
  console.log('📝 Creating initial activity log...');
  await prisma.activityLog.create({
    data: {
      type: 'CREATE',
      entityType: 'Tree',
      entityId: guptaTree.id,
      metadata: {
        action: 'Seeded Gupta family tree with 19 members and full relationships',
      },
      userId: demoUser.id,
    },
  });
  console.log('   ✓ Created activity log entry\n');

  // ─────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────
  const memberCount = await prisma.member.count();
  const relationshipCount = await prisma.relationship.count();
  const treeCount = await prisma.tree.count();
  const userCount = await prisma.user.count();

  console.log('═══════════════════════════════════════');
  console.log('  🎉 Seed completed successfully!');
  console.log('═══════════════════════════════════════');
  console.log(`  Users:         ${userCount}`);
  console.log(`  Trees:         ${treeCount}`);
  console.log(`  Members:       ${memberCount}`);
  console.log(`  Relationships: ${relationshipCount}`);
  console.log('═══════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
