import prisma from '../src/lib/prisma';

async function main() {
  console.log('Setting up Database Constraints...');

  // 1. Unique Relationship Rule
  // A and B can only have ONE type of relationship
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION check_unique_relationship() RETURNS TRIGGER AS $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM "Relationship"
        WHERE ((fromId = NEW.fromId AND toId = NEW.toId) OR (fromId = NEW.toId AND toId = NEW.fromId))
          AND id != NEW.id
      ) THEN
        RAISE EXCEPTION 'Only one relationship category may exist between two members';
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
  
  await prisma.$executeRawUnsafe(`
    DROP TRIGGER IF EXISTS enforce_unique_relationship ON "Relationship";
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TRIGGER enforce_unique_relationship
    BEFORE INSERT OR UPDATE ON "Relationship"
    FOR EACH ROW EXECUTE FUNCTION check_unique_relationship();
  `);

  // 2. Max 2 Parents
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION check_max_parents() RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.type = 'PARENT' THEN
        IF (SELECT COUNT(*) FROM "Relationship" WHERE toId = NEW.toId AND type = 'PARENT' AND id != NEW.id) >= 2 THEN
          RAISE EXCEPTION 'Maximum two parents allowed';
        END IF;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await prisma.$executeRawUnsafe(`
    DROP TRIGGER IF EXISTS enforce_max_parents ON "Relationship";
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TRIGGER enforce_max_parents
    BEFORE INSERT OR UPDATE ON "Relationship"
    FOR EACH ROW EXECUTE FUNCTION check_max_parents();
  `);

  // 3. Max 1 Spouse
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION check_max_spouse() RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.type = 'SPOUSE' THEN
        IF (SELECT COUNT(*) FROM "Relationship" WHERE type = 'SPOUSE' AND (fromId = NEW.fromId OR toId = NEW.fromId OR fromId = NEW.toId OR toId = NEW.toId) AND id != NEW.id) >= 1 THEN
          RAISE EXCEPTION 'Maximum 1 spouse allowed';
        END IF;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await prisma.$executeRawUnsafe(`
    DROP TRIGGER IF EXISTS enforce_max_spouse ON "Relationship";
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TRIGGER enforce_max_spouse
    BEFORE INSERT OR UPDATE ON "Relationship"
    FOR EACH ROW EXECUTE FUNCTION check_max_spouse();
  `);

  console.log('Database constraints applied successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
