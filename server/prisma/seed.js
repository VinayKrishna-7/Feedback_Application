import prisma from '../src/lib/prisma.js';

async function main() {
  console.log('[Seed] Seeding sample development data...');

  // Clean existing seed data if exists with these sample tokens
  const samplePublicToken = 'demo-sample-page';
  const sampleAdminToken = 'demo-admin-token-secret-12345';

  await prisma.feedback.deleteMany({
    where: {
      form: {
        publicToken: samplePublicToken
      }
    }
  });

  await prisma.form.deleteMany({
    where: {
      publicToken: samplePublicToken
    }
  });

  // Create demo form
  const form = await prisma.form.create({
    data: {
      title: 'Q3 Product Demo & Team Presentation',
      publicToken: samplePublicToken,
      adminToken: sampleAdminToken,
      feedback: {
        create: [
          {
            message: 'Your explanation of the architecture was crystal clear and easy to follow!',
            category: 'positive'
          },
          {
            message: 'Great pacing overall, really enjoyed the visual diagrams in the slides.',
            category: 'positive'
          },
          {
            message: 'The slides on section 3 felt a bit rushed. Maybe allow 5 more minutes for Q&A.',
            category: 'improvement'
          },
          {
            message: 'Could we get a recording link or summary notes sent over Slack afterwards?',
            category: 'general'
          }
        ]
      }
    }
  });

  console.log(`[Seed] Sample form created successfully:`);
  console.log(`       Title:        "${form.title}"`);
  console.log(`       Public link:  /f/${form.publicToken}`);
  console.log(`       Admin link:   /manage/${form.adminToken}`);
}

main()
  .catch((e) => {
    console.error('[Seed] Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
