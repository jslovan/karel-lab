import pl from 'tau-prolog';
import fs from 'fs';
import path from 'path';

import 'tau-prolog/modules/format.js';
import 'tau-prolog/modules/lists.js';
import 'tau-prolog/modules/js.js';

function runSuite(name, langFile, testFile) {
  return new Promise((resolve, reject) => {
    const session = pl.create(100000);

    const helpers = `
:- use_module(library(lists)).
:- use_module(library(format)).
:- use_module(library(js)).

writeln(X) :- write(X), nl.
format(Format, _Args) :- write(Format), nl.
`;

    const langSrc = fs.readFileSync(path.resolve(langFile), 'utf-8');
    const karelDcgSrc = fs.readFileSync(path.resolve('src/karel_dcg.pl'), 'utf-8');
    const testSrc = fs.readFileSync(path.resolve(testFile), 'utf-8');

    const fullProgram = helpers + "\n" + langSrc + "\n" + karelDcgSrc + "\n" + testSrc;

    session.consult(fullProgram, {
      success: () => {
        console.log(`\n========================================`);
        console.log(`▶ Running Suite: ${name} (${testFile})`);
        console.log(`========================================`);
        session.query("run_tests.", {
          success: () => {
            session.answer({
              success: (ans) => {
                if (ans && !pl.type.is_error(ans)) {
                  console.log(`✅ [${name}] ALL TESTS PASSED`);
                  resolve();
                } else {
                  console.error(`❌ [${name}] FAILED:`, ans ? ans.toString() : 'false');
                  reject(new Error(`Test suite ${name} failed`));
                }
              },
              error: (err) => {
                console.error(`❌ [${name}] Execution error:`, err ? (typeof err.toString === 'function' ? err.toString() : JSON.stringify(err)) : err);
                reject(err);
              },
              fail: () => {
                console.error(`❌ [${name}] run_tests evaluated to false.`);
                reject(new Error(`Test suite ${name} evaluated to false`));
              },
              limit: () => {
                console.error(`❌ [${name}] Limit reached.`);
                reject(new Error(`Test suite ${name} limit reached`));
              }
            });
          },
          error: (err) => {
            console.error(`❌ [${name}] Query syntax error:`, err);
            reject(err);
          }
        });
      },
      error: (err) => {
        console.error(`❌ [${name}] Consult error:`, err);
        reject(err);
      }
    });
  });
}

import { runStorageTests } from './tests/storage.test.js';
import { runAstParserTests } from './tests/ast_parser.test.js';
import { runVmExecutionTests } from './tests/vm_execution.test.js';

async function main() {
  try {
    // 1. Run Storage and AST Unit Tests
    await runStorageTests();
    await runAstParserTests();
    await runVmExecutionTests();

    // 2. Run DCG Prolog Integration Suites
    await runSuite("Czech Suite (test_karel_dcg_cs.pl)", "src/lang_cs.pl", "test_karel_dcg_cs.pl");
    await runSuite("English Suite (test_karel_dcg_en.pl)", "src/lang_en.pl", "test_karel_dcg_en.pl");
    console.log("\n🎉 ALL UNIT & PROLOG TEST SUITES PASSED SUCCESSFULLY!\n");
    process.exit(0);
  } catch (e) {
    console.error("\n❌ TESTS FAILED:\n", e);
    process.exit(1);
  }
}


main();

