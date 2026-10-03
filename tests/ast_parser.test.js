import assert from 'assert';
import { tokenizeKarel } from '../src/core/prolog/astParser.ts';

export async function runAstParserTests() {
  console.log('\n--- AST Parser & Tokenizer Unit Tests ---');

  // Test 1: Tokenize basic code with comments and brackets
  const code = `
    // Czech Karel test
    definuj otoc_vpravo [ # inline comment
      vlevo
      vlevo
      vlevo
    ]
    
    opakuj 3 [
      krok
      poloz
    ]
  `;

  const tokens = tokenizeKarel(code);
  const expected = [
    'definuj', 'otoc_vpravo', 'lsquare',
    'vlevo', 'vlevo', 'vlevo',
    'rsquare',
    'opakuj', '3', 'lsquare',
    'krok', 'poloz',
    'rsquare'
  ];

  assert.deepStrictEqual(tokens, expected, 'Tokenizer must strip comments and expand brackets to atom tokens');

  // Test 2: Tokenize English code with conditionals
  const enCode = `
    while not wall [
      if beeper [
        pick
      ] else [
        step
      ]
    ]
  `;

  const enTokens = tokenizeKarel(enCode);
  const expectedEn = [
    'while', 'not', 'wall', 'lsquare',
    'if', 'beeper', 'lsquare',
    'pick',
    'rsquare', 'else', 'lsquare',
    'step',
    'rsquare',
    'rsquare'
  ];

  assert.deepStrictEqual(enTokens, expectedEn, 'Tokenizer must correctly tokenize english conditional control structures');

  console.log('✅ Tokenizer and AST parser tests passed!');
}
