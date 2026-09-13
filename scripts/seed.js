// One-off seed script — loads the Claude Design prototype's sample IBU
// Analysis item bank and sample candidates into Firestore.
//
// Usage:
//   1. Download a service account key for your Firebase project
//      (Project settings > Service accounts > Generate new private key)
//      and save it as scripts/serviceAccountKey.json (gitignored).
//   2. node scripts/seed.js

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const KP = [
  { text: 'States the purpose of the IBU analysis and its spec range', category: 'Purpose', critical: false },
  { text: 'Confirms sample identity against the batch record', category: 'Traceability', critical: true },
  { text: 'Selects correct glassware and checks the calibration date', category: 'Equipment', critical: false },
  { text: 'Describes the extraction solvent hazard and its controls', category: 'Safety', critical: true },
  { text: 'Explains the spectrophotometer blanking procedure', category: 'Method', critical: false },
  { text: 'States the acceptance criteria for duplicate agreement', category: 'Method', critical: false },
  { text: 'Identifies when a result must be repeated', category: 'Judgement', critical: false },
  { text: 'Describes the correct waste disposal route', category: 'Safety', critical: false },
];

const TS = [
  { text: 'Dons PPE correctly before starting', category: 'Safety', critical: true },
  { text: 'Pipettes 10 mL of sample with correct technique', category: 'Technique', critical: false },
  { text: 'Adds acid and iso-octane, caps securely', category: 'Technique', critical: true },
  { text: 'Shakes for the full 15 minutes on the mechanical shaker', category: 'Method', critical: false },
  { text: 'Centrifuges and transfers the upper layer cleanly', category: 'Technique', critical: false },
  { text: 'Reads absorbance at 275 nm against the blank', category: 'Instrument', critical: false },
  { text: 'Records the result in LIMS to one decimal place', category: 'Recording', critical: false },
];

const CANDIDATES = [
  { name: 'Arnold William', role: 'Analyst', expectedLevelDefault: 5 },
  { name: 'Priya Raman', role: 'Analyst', expectedLevelDefault: 4 },
  { name: 'Tom Okafor', role: 'Technician', expectedLevelDefault: 3 },
  { name: 'Lena Brandt', role: 'Analyst', expectedLevelDefault: 5 },
];

async function seed() {
  const processRef = await db.collection('processes').add({ name: 'IBU Analysis' });
  const processId = processRef.id;

  const batch = db.batch();
  KP.forEach((item, i) => {
    const ref = db.collection('items').doc();
    batch.set(ref, { processId, section: 'kp', order: i, ...item });
  });
  TS.forEach((item, i) => {
    const ref = db.collection('items').doc();
    batch.set(ref, { processId, section: 'ts', order: i, ...item });
  });
  CANDIDATES.forEach((c) => {
    const ref = db.collection('candidates').doc();
    batch.set(ref, c);
  });
  await batch.commit();

  console.log(`Seeded process "IBU Analysis" (${processId}) with ${KP.length} KP items, ${TS.length} TS items, and ${CANDIDATES.length} candidates.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
