import assert from 'assert';
import pl from 'tau-prolog';
import fs from 'fs';
import path from 'path';
import 'tau-prolog/modules/lists.js';

export function runVmExecutionTests() {
  return new Promise((resolve, reject) => {
    console.log('\n--- VM & Step Execution Unit Tests ---');
    const session = pl.create(10000);
    const karelSrc = fs.readFileSync(path.resolve('src/karel_dcg.pl'), 'utf-8');
    const langCsSrc = fs.readFileSync(path.resolve('src/lang_cs.pl'), 'utf-8');

    session.consult(karelSrc + '\n' + langCsSrc, {
      success: () => {
        // Test 1: parse_source query
        const query1 = "parse_source(['opakuj', '2', 'lsquare', 'krok', 'rsquare'], Code, Defs).";
        session.query(query1, {
          success: () => {
            session.answer({
              success: (ans) => {
                assert(ans, 'parse_source should succeed for opakuj 2 [ krok ]');
                const codeTerm = ans.lookup('Code');
                assert(codeTerm, 'Code term should be found');
                
                // Test 2: reduce_step query for step
                const query2 = "reduce_step(world(karel(1,1,sever), [], []), builtin(krok, step), [], Change, Expansion).";
                session.query(query2, {
                  success: () => {
                    session.answer({
                      success: (ans2) => {
                        assert(ans2, 'reduce_step for krok should succeed');
                        const changeTerm = ans2.lookup('Change');
                        assert.strictEqual(changeTerm.id, 'world_change');

                        // Test 3: Sensing explicit boundary walls at all 4 sides
                        const query3 = "eval_predicate(predicate(je, je, sensor(zed, zed)), world(karel(1, 1, zapad), [wall(0, 1, vychod)], [])).";
                        session.query(query3, {
                          success: () => {
                            session.answer({
                              success: (ans3) => {
                                assert(ans3, 'West boundary wall (0, 1, vychod) must be sensed by Karel facing zapad at x=1');

                                const query4 = "eval_predicate(predicate(je, je, sensor(zed, zed)), world(karel(1, 1, jih), [wall(1, 0, sever)], [])).";
                                session.query(query4, {
                                  success: () => {
                                    session.answer({
                                      success: (ans4) => {
                                        assert(ans4, 'South boundary wall (1, 0, sever) must be sensed by Karel facing jih at y=1');

                                        const query5 = "eval_predicate(predicate(je, je, sensor(zed, zed)), world(karel(10, 10, vychod), [wall(10, 10, vychod)], [])).";
                                        session.query(query5, {
                                          success: () => {
                                            session.answer({
                                              success: (ans5) => {
                                                assert(ans5, 'East boundary wall (10, 10, vychod) must be sensed by Karel facing vychod at x=10');

                                                const query6 = "eval_predicate(predicate(je, je, sensor(zed, zed)), world(karel(10, 10, sever), [wall(10, 10, sever)], [])).";
                                                session.query(query6, {
                                                  success: () => {
                                                    session.answer({
                                                      success: (ans6) => {
                                                        assert(ans6, 'North boundary wall (10, 10, sever) must be sensed by Karel facing sever at y=10');
                                                        console.log('✅ VM step execution and boundary wall sensing tests passed!');
                                                        resolve();
                                                      },
                                                      error: (e) => reject(e),
                                                      fail: () => reject(new Error('North boundary sensing failed'))
                                                    });
                                                  },
                                                  error: (e) => reject(e)
                                                });
                                              },
                                              error: (e) => reject(e),
                                              fail: () => reject(new Error('East boundary sensing failed'))
                                            });
                                          },
                                          error: (e) => reject(e)
                                        });
                                      },
                                      error: (e) => reject(e),
                                      fail: () => reject(new Error('South boundary sensing failed'))
                                    });
                                  },
                                  error: (e) => reject(e)
                                });
                              },
                              error: (e) => reject(e),
                              fail: () => reject(new Error('West boundary sensing failed'))
                            });
                          },
                          error: (e) => reject(e)
                        });
                      },
                      error: (e) => reject(e),
                      fail: () => reject(new Error('reduce_step query failed'))
                    });
                  },
                  error: (e) => reject(e)
                });
              },
              error: (e) => reject(e),
              fail: () => reject(new Error('parse_source query failed'))
            });
          },
          error: (e) => reject(e)
        });
      },
      error: (e) => reject(e)
    });
  });
}
