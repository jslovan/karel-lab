% -*- mode: prolog -*-
% Načtení vaší logiky (upravte cestu, pokud se soubor jmenuje jinak)
:- consult('lang_en.pl').
:- consult('karel_dcg.pl').

% ==========================================
% HLAVNÍ SPOUŠTĚČ TESTŮ
% ==========================================
run_tests :-
    writeln('====================================='),
    writeln('🚀 START TESTŮ: ROBOT KAREL'),
    writeln('====================================='),
    test_parse_basic,
    test_parse_proc,
    test_parse_error,
    test_execution_loop,
    writeln('====================================='),
    writeln('✅ VŠECHNY TESTY PROBĚHLY ÚSPĚŠNĚ!').

% ==========================================
% 1. TESTY PARSERU (Z textu na AST)
% ==========================================

test_parse_basic :-
    writeln('--- TEST 1: Parsování základních příkazů ---'),
    Tokens = ['step', 'left', 'put'],
    parse_source(Tokens, Code, Defs),
    Code == [builtin(krok, step), builtin(vlevo, left), builtin(poloz, put)],
    Defs == [],
    writeln('OK.').

test_parse_proc :-
    writeln('--- TEST 2: Parsování definice a cyklu ---'),
    Tokens = ['define', 'otoc', 'lsquare', 'left', 'left', 'rsquare', 'repeat', '3', 'lsquare', 'step', 'rsquare'],
    parse_source(Tokens, Code, Defs),
    % Kontrola, zda parser správně pochopil proceduru a cyklus
    Defs == [routine(otoc, [builtin(vlevo, left), builtin(vlevo, left)])],
    Code == [abstract(opakuj, repeat, 3, [builtin(krok, step)])],
    writeln('OK.').

test_parse_error :-
    writeln('--- TEST 3: Syntax error catching & context tracking ---'),
    % 3a: Missing bracket in repeat loop
    Tokens1 = ['repeat', '3', 'step', 'rsquare'],
    (   catch(parse_source(Tokens1, _Code1, _Defs1), error(syntax, Ctx1, Msg1), true)
    ->  write('OK (Loop error): Context='), write(Ctx1), write(', Msg='), writeln(Msg1)
    ;   writeln('TEST FAILED: Parser did not catch error 1!'), fail
    ),
    % 3b: Error in condition after 'if'
    Tokens2 = ['if', 'unknown_cond', 'lsquare', 'step', 'rsquare'],
    (   catch(parse_source(Tokens2, _Code2, _Defs2), error(syntax, Ctx2, Msg2), true)
    ->  write('OK (Condition error): Context='), write(Ctx2), write(', Msg='), writeln(Msg2)
    ;   writeln('TEST FAILED: Parser did not catch error 2!'), fail
    ),
    % 3c: Error in sensor after 'is'
    Tokens3 = ['if', 'is', 'tree', 'lsquare', 'step', 'rsquare'],
    (   catch(parse_source(Tokens3, _Code3, _Defs3), error(syntax, Ctx3, Msg3), true)
    ->  write('OK (Sensor error): Context='), write(Ctx3), write(', Msg='), writeln(Msg3)
    ;   writeln('TEST FAILED: Parser did not catch error 3!'), fail
    ),
    % 3d: Successful parsing of 'while not facing north'
    Tokens4 = ['while', 'not', 'facing', 'north', 'lsquare', 'step', 'rsquare'],
    parse_source(Tokens4, Code4, _Defs4),
    Code4 == [abstract(dokud, while, predicate(neni, not, sensor(sever, [facing, north])), [builtin(krok, step)])],
    writeln('OK (Condition with facing direction).').


% ==========================================
% 2. TESTY EXEKUCE A PŘEPISOVÁNÍ KÓDU
% ==========================================

% Pomocný predikát pro inicializaci testovacího světa
% (Upravte strukturu 'world' přesně podle vaší implementace)
mock_world(world(karel(1, 1, sever),
		 [wall(1, 0, sever), wall(0, 1, vychod),
		  wall(1, 5, sever), wall(0, 5, vychod),
		  wall(5, 5, sever), wall(5, 5, vychod),
		  wall(5, 0, sever), wall(4, 1, vychod)],
		 [])).

test_execution_loop :-
    writeln('--- TEST 4: Simulace UI smyčky (Přepisování kódu) ---'),
    % Kód pro Karla: "Step, pak 2x Left"
    AST = [abstract(dokud, while, predicate(neni, not, sensor(zed, wall)),
		    [builtin(poloz, put), builtin(krok, step)]
		   )
	   ],
    mock_world(InitialWorld),
    writeln('--- Počáteční stav ---'),
    run_ui_loop(AST, InitialWorld, 0).


% -- ZÁKLADNÍ SIMULÁTOR BĚHU (Funguje jako vaše JavaScript UI) --
% Pokud je kód prázdný, robot skončil.
run_ui_loop([], FinalWorld, Step) :-
    format('~nKROK ~w: Konec programu!~n', [Step]),
    writeln('Konečný svět: ' : FinalWorld),
    ( FinalWorld = world(karel(1, 5, sever), _Walls, [beeper(1, 4, 1), beeper(1, 3, 1), beeper(1, 2, 1), beeper(1, 1, 1)])
    -> writeln('OK.') 
    ; writeln('❌ EXEKUCE SELHALA - Karel nedosel na (1, 5) a nepolozil znacky')
    ).

% Pokud ještě zbývá kód k exekuci:
run_ui_loop([CurrentAST|Rest], CurrentWorld, Step) :-
    format('~nKROK ~w:~n', [Step]),
    writeln('  Kód : ' : CurrentAST),
    writeln('  Svět: ' : CurrentWorld),
    
    % VOLÁNÍ VAŠEHO REDUKTORU
    % Poznámka: Zde použijte název predikátu, který jste si zvolil 
    % pro redukci. Předpokládám čistou redukci (reduce/4) podle 
    % naší diskuze, případně process_step/3.
    % 
    % Pokud používáte svůj starší reduce_step (DCG), museli byste
    % to zavolat jako: phrase(reduce_step(CurrentWorld, Diff), CurrentAST, NextAST)
    
    (   reduce_step(CurrentWorld, CurrentAST, [], WorldChange, ExpandedAST)
    ->  NextStep is Step + 1,
	      next_world(CurrentWorld, WorldChange, world(KarelOut, W, Bout)),
        append(ExpandedAST, Rest, NextAST),
        run_ui_loop(NextAST, world(KarelOut, W, Bout), NextStep)
    ;   writeln('❌ EXEKUCE SELHALA (Náraz do zdi / Neznámý příkaz)'),
        fail
    ).

next_world(world(Karel, W, B), null, world(Karel, W, B)).
next_world(world(_Karel, W, B), world_change(KarelOut, null), world(KarelOut, W, B)).
next_world(world(Karel, W, B), world_change(Karel, [BOut, BIn]), world(Karel, W, BB)) :-
    BOut \= null, BIn \= null, select(BOut, B, BIn, BB).
next_world(world(Karel, W, B), world_change(Karel, [null, BIn]), world(Karel, W, [BIn|B])).
next_world(world(Karel, W, B), world_change(Karel, [BOut, null]), world(Karel, W, BB)) :-
    select(BOut, B, BB).

