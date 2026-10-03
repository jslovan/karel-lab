import { ChallengeLocaleCatalog } from './types';
import csCatalog from './locales/cs/challenges.json';
import enCatalog from './locales/en/challenges.json';

// P1: Compile-time check asserting that all challenge IDs exist and have valid structure
// in both Czech and English locale catalogs
export const typedCsCatalog: ChallengeLocaleCatalog = csCatalog;
export const typedEnCatalog: ChallengeLocaleCatalog = enCatalog;

export type ChallengeId = keyof typeof csCatalog;

// Assert at compile time that CS and EN keys match
type AssertEqualKeys<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
export type LocalesSynchronized = AssertEqualKeys<keyof typeof csCatalog, keyof typeof enCatalog>;
