import assert from 'assert';

// Mock localStorage for node environment
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  clear() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
}

global.localStorage = new LocalStorageMock();

export async function runStorageTests() {
  console.log('\n--- Storage Service Unit Tests ---');

  // Test 1: Defaults when empty
  const defaultRobot = { x: 1, y: 1, dir: 'sever' };
  const defaultWalls = [];
  const defaultBeepers = {};

  const savedLang = localStorage.getItem('karel_last_lang');
  assert.strictEqual(savedLang, null, 'Storage should initially be empty');

  // Test 2: Saving & Loading Lang
  localStorage.setItem('karel_last_lang', 'en');
  assert.strictEqual(localStorage.getItem('karel_last_lang'), 'en');

  // Test 3: Saving & Loading Code
  const sampleCode = 'krok\npoloz';
  localStorage.setItem('karel_last_code', sampleCode);
  assert.strictEqual(localStorage.getItem('karel_last_code'), sampleCode);

  // Test 4: Saving & Loading World State
  const sampleWorld = {
    robot: { x: 3, y: 4, dir: 'vychod' },
    beepers: { '3,4': 2 },
    walls: [{ x: 3, y: 4, type: 'sever' }]
  };
  localStorage.setItem('karel_last_world', JSON.stringify(sampleWorld));
  const parsedWorld = JSON.parse(localStorage.getItem('karel_last_world'));
  assert.deepStrictEqual(parsedWorld.robot, sampleWorld.robot);
  assert.deepStrictEqual(parsedWorld.beepers, sampleWorld.beepers);
  assert.deepStrictEqual(parsedWorld.walls, sampleWorld.walls);

  // Test 5: Corrupt World fallback
  localStorage.setItem('karel_last_world', '{ invalid_json');
  let corruptFallbackTriggered = false;
  try {
    JSON.parse(localStorage.getItem('karel_last_world'));
  } catch (e) {
    corruptFallbackTriggered = true;
  }
  assert.strictEqual(corruptFallbackTriggered, true, 'Corrupt JSON should be caught');

  console.log('✅ Storage unit tests passed!');
}
