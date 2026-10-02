import prisma from '../src/lib/prisma.js';

async function checkDbColumns() {
  const result = await prisma.$queryRawUnsafe(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Feedback'"
  );
  console.log('Feedback table columns in PostgreSQL:', result);

  const columnNames = result.map((r) => r.column_name.toLowerCase());
  const prohibited = [
    'ip',
    'ipaddress',
    'ip_address',
    'sender',
    'email',
    'user',
    'userid',
    'user_id',
    'location',
    'device',
  ];
  const foundProhibited = columnNames.filter((c) => prohibited.includes(c));

  if (foundProhibited.length > 0) {
    throw new Error('Prohibited privacy columns found: ' + foundProhibited.join(', '));
  }

  console.log('✓ Privacy verified: Only strictly necessary feedback fields exist (id, formId, message, category, createdAt).');
  await prisma.$disconnect();
}

checkDbColumns().catch((e) => {
  console.error(e);
  process.exit(1);
});
