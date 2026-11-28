import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from '../config/firebase';
import { PACKAGES_CATALOG } from '../data/landingData';

const PACKAGES_COLLECTION = 'paquetes_catalogo';

export function formatArsPrice(amount) {
  const numeric = Number(amount) || 0;
  return `$${numeric.toLocaleString('es-AR')}`;
}

export function getPackageNumericPrice(pkg) {
  if (!pkg) return 0;
  if (typeof pkg.numericPrice === 'number' && !Number.isNaN(pkg.numericPrice) && pkg.numericPrice > 0) {
    return pkg.numericPrice;
  }
  const direct = Number(pkg.price);
  if (!Number.isNaN(direct) && direct > 0) return direct;
  const digits = Number(String(pkg.price || '').replace(/\D/g, ''));
  return Number.isNaN(digits) ? 0 : digits;
}

function normalizePackageDoc(docSnap) {
  const data = docSnap.data() || {};
  const numericPrice = Number(data.numericPrice) || 0;
  return {
    id: docSnap.id,
    category: data.category || '',
    name: data.name || '',
    frequency: data.frequency || '',
    numericPrice,
    price: data.price || formatArsPrice(numericPrice),
    classesCount: Number(data.classesCount) || 1,
    validityDays: Number(data.validityDays) || 30,
    features: Array.isArray(data.features) ? data.features : [],
    isPopular: Boolean(data.isPopular),
    isProtected: Boolean(data.isProtected || docSnap.id === 'plan-individual'),
    active: data.active !== false,
    order: Number(data.order) || 99,
  };
}

function sortPackages(list) {
  return [...list].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.classesCount - b.classesCount;
  });
}

function buildPackagePayload(formData) {
  const numericPrice = Math.max(0, Number(formData.numericPrice) || 0);
  const classesCount = Math.max(1, Math.min(100, parseInt(formData.classesCount, 10) || 1));
  const validityDays = Math.max(1, Math.min(365, parseInt(formData.validityDays, 10) || 30));
  const features = Array.isArray(formData.features)
    ? formData.features.map((f) => String(f).trim()).filter(Boolean)
    : String(formData.featuresText || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

  return {
    category: String(formData.category || '').trim(),
    name: String(formData.name || '').trim(),
    frequency: String(formData.frequency || '').trim(),
    numericPrice,
    price: formatArsPrice(numericPrice),
    classesCount,
    validityDays,
    features,
    isPopular: Boolean(formData.isPopular),
    active: formData.active !== false,
    order: Number(formData.order) || classesCount,
  };
}

/**
 * Fetches all packages from Firestore `paquetes_catalogo`.
 */
export async function fetchPackages() {
  const snapshot = await getDocs(collection(db, PACKAGES_COLLECTION));
  return sortPackages(snapshot.docs.map(normalizePackageDoc));
}

/**
 * Fetches active packages for the public landing page, falling back to PACKAGES_CATALOG
 * when Firestore/Functions are not yet seeded or unreachable.
 */
export async function fetchPublicPackages() {
  try {
    if (auth.currentUser) {
      const list = await fetchPackages();
      const activeList = list.filter((pkg) => pkg.active);
      return activeList.length > 0 ? activeList : PACKAGES_CATALOG;
    }

    const callable = httpsCallable(functions, 'getPublicPackages');
    const result = await callable({ databaseId: db.app.options.databaseId || undefined });
    const list = Array.isArray(result?.data?.packages) ? result.data.packages : [];
    return list.length > 0 ? sortPackages(list) : PACKAGES_CATALOG;
  } catch {
    return PACKAGES_CATALOG;
  }
}

/**
 * Seeds the 4 default packages in Firestore when the catalog is empty.
 */
export async function seedDefaultPackages() {
  await Promise.all(
    PACKAGES_CATALOG.map((pkg) =>
      setDoc(doc(db, PACKAGES_COLLECTION, pkg.id), {
        category: pkg.category,
        name: pkg.name,
        frequency: pkg.frequency,
        numericPrice: pkg.numericPrice,
        price: pkg.price,
        classesCount: pkg.classesCount,
        validityDays: pkg.validityDays,
        features: pkg.features,
        isPopular: Boolean(pkg.isPopular),
        isProtected: Boolean(pkg.isProtected),
        active: pkg.active !== false,
        order: pkg.order,
        creadoEn: serverTimestamp(),
      })
    )
  );
  return PACKAGES_CATALOG;
}

export async function createPackage(formData) {
  const payload = {
    ...buildPackagePayload(formData),
    isProtected: false,
    creadoEn: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, PACKAGES_COLLECTION), payload);
  return { id: docRef.id, ...payload };
}

export async function updatePackage(packageId, formData, { isProtected = false } = {}) {
  const payload = buildPackagePayload(formData);
  if (isProtected) {
    payload.isProtected = true;
  }
  await updateDoc(doc(db, PACKAGES_COLLECTION, packageId), {
    ...payload,
    actualizadoEn: serverTimestamp(),
  });
  return { id: packageId, ...payload };
}

export async function updatePackageActiveStatus(packageId, nextActive) {
  await updateDoc(doc(db, PACKAGES_COLLECTION, packageId), {
    active: Boolean(nextActive),
    actualizadoEn: serverTimestamp(),
  });
}

export async function deletePackage(pkg) {
  if (pkg?.isProtected || pkg?.id === 'plan-individual') {
    throw new Error('El paquete de Clase Individual es obligatorio y no puede eliminarse.');
  }
  await deleteDoc(doc(db, PACKAGES_COLLECTION, pkg.id));
}
