// One-off seed script — loads the Claude Design prototype's sample IBU
// Analysis item bank and sample candidates into Firestore, using the same
// client SDK and config as the app (Firestore rules only require a signed-in
// user, so no service account/admin credentials are needed).
//
// Usage:
//   SEED_EMAIL=you@company.com SEED_PASSWORD=... node scripts/seed.js
// (creates that auditor account if it doesn't exist yet, then seeds data)

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, doc, writeBatch, setDoc } = require('firebase/firestore');
const appJson = require('../app.json');

const firebaseConfig = appJson.expo.extra.firebase;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const SEED_EMAIL = process.env.SEED_EMAIL || 'auditor@example.com';
const SEED_PASSWORD = process.env.SEED_PASSWORD || 'ChangeMe123!';
const SEED_NAME = process.env.SEED_NAME || 'Demo Auditor';

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

async function ensureAuditor() {
  try {
    const cred = await createUserWithEmailAndPassword(auth, SEED_EMAIL, SEED_PASSWORD);
    await setDoc(doc(db, 'users', cred.user.uid), { name: SEED_NAME, email: SEED_EMAIL });
    console.log(`Created auditor account ${SEED_EMAIL} (password: ${SEED_PASSWORD} — sign in with this in the app, or use "Create account" for your own).`);
    return cred.user;
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      const cred = await signInWithEmailAndPassword(auth, SEED_EMAIL, SEED_PASSWORD);
      console.log(`Signed in as existing auditor ${SEED_EMAIL}.`);
      return cred.user;
    }
    throw err;
  }
}

async function seed() {
  const user = await ensureAuditor();
  const userCol = (name) => collection(db, 'users', user.uid, name);

  const processRef = doc(userCol('processes'));
  const processId = processRef.id;

  const batch = writeBatch(db);
  batch.set(processRef, { name: 'IBU Analysis' });
  KP.forEach((item, i) => {
    batch.set(doc(userCol('items')), { processId, section: 'kp', order: i, ...item });
  });
  TS.forEach((item, i) => {
    batch.set(doc(userCol('items')), { processId, section: 'ts', order: i, ...item });
  });
  CANDIDATES.forEach((c) => {
    batch.set(doc(userCol('candidates')), c);
  });
  await batch.commit();

  console.log(
    `Seeded process "IBU Analysis" (${processId}) with ${KP.length} KP items, ${TS.length} TS items, and ${CANDIDATES.length} candidates.`
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
