import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

async function main() {
  console.log('Finding briefs with null share_token...');

  const briefsWithoutToken = await prisma.brief.findMany({
    where: {
      shareToken: null,
    },
    select: {
      id: true,
    },
  });

  console.log(`Found ${briefsWithoutToken.length} briefs without share tokens.`);

  if (briefsWithoutToken.length === 0) {
    console.log('No briefs to update!');
    return;
  }

  console.log('Generating unique tokens...');

  for (const brief of briefsWithoutToken) {
    const shareToken = nanoid(16);
    await prisma.brief.update({
      where: { id: brief.id },
      data: { shareToken },
    });
  }

  console.log('✓ All briefs now have unique share tokens!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
