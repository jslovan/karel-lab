% -*- mode: prolog -*-
% Načtení vaší logiky (upravte cestu, pokud se soubor jmenuje jinak)
:- consult('src/lang_cs.pl').
:- consult('src/karel_dcg.pl').

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
    Tokens = ['krok', 'vlevo', 'poloz'],
    parse_source(Tokens, Code, Defs),
    Code == [builtin(krok, krok), builtin(vlevo, vlevo), builtin(poloz, poloz)],
    Defs == [],
    writeln('OK.').

test_parse_proc :-
    writeln('--- TEST 2: Parsování definice a cyklu ---'),
    Tokens = ['definuj', 'otoc', 'lsquare', 'vlevo', 'vlevo', 'rsquare', 'opakuj', '3', 'lsquare', 'krok', 'rsquare'],
    parse_source(Tokens, Code, Defs),
    % Kontrola, zda parser správně pochopil proceduru a cyklus
    Defs == [routine(otoc, [builtin(vlevo, vlevo), builtin(vlevo, vlevo)])],
    Code == [abstract(opakuj, opakuj, 3, [builtin(krok, krok)])],
    writeln('OK.').

test_parse_error :-
    writeln('--- TEST 3: Záchyt syntaktických chyb a kontextu ---'),
    % 3a: Úmyslně chybí závorka za příkazem 'opakuj 3'
    Tokens1 = ['opakuj', '3', 'krok', 'rsquare'],
    (   catch(parse_source(Tokens1, _Code1, _Defs1), error(syntax, Ctx1, Msg1), true)
    ->  write('OK (Chyba v cyklu): Context='), write(Ctx1), write(', Msg='), writeln(Msg1)
    ;   writeln('CHYBA TESTU: Parser chybu 1 nezachytil!'), fail
    ),
    % 3b: Chyba v podmínce za 'kdyz'
    Tokens2 = ['kdyz', 'neznama_podminka', 'lsquare', 'krok', 'rsquare'],
    (   catch(parse_source(Tokens2, _Code2, _Defs2), error(syntax, Ctx2, Msg2), true)
    ->  write('OK (Chyba v podmínce): Context='), write(Ctx2), write(', Msg='), writeln(Msg2)
    ;   writeln('CHYBA TESTU: Parser chybu 2 nezachytil!'), fail
    ),
    % 3c: Chyba v senzoru za 'je'
    Tokens3 = ['kdyz', 'je', 'strom', 'lsquare', 'krok', 'rsquare'],
    (   catch(parse_source(Tokens3, _Code3, _Defs3), error(syntax, Ctx3, Msg3), true)
    ->  write('OK (Chyba v senzoru): Context='), write(Ctx3), write(', Msg='), writeln(Msg3)
    ;   writeln('CHYBA TESTU: Parser chybu 3 nezachytil!'), fail
    ),
    % 3d: Úspěšné parsování 'kdyz je na sever'
    Tokens4 = ['kdyz', 'je', 'na', 'sever', 'lsquare', 'krok', 'rsquare'],
    parse_source(Tokens4, Code4, _Defs4),
    Code4 == [abstract(kdyz, kdyz, predicate(je, je, sensor(sever, [na, sever])), [builtin(krok, krok)], [])],
    writeln('OK (Podmínka se směrem).').


% ==========================================
% 2. TESTY EXEKUCE A PŘEPISOVÁNÍ KÓDU
% ==========================================

% Pomocný predikát pro inicializaci testovacího světa
% (Upravte strukturu 'world' přesně podle vaší implementace)
mock_world(world(karel(1, 1, sever), [], [])).

test_execution_loop :-
    writeln('--- TEST 4: Simulace UI smyčky (Přepisování kódu) ---'),
    % Kód pro Karla: "Krok, pak 2x Vlevo"
    AST = [builtin(krok, krok), abstract(opakuj, opakuj, 2, [builtin(vlevo, vlevo)])],
    mock_world(InitialWorld),
    writeln('--- Počáteční stav ---'),
    run_ui_loop(AST, InitialWorld, 0).


% -- ZÁKLADNÍ SIMULÁTOR BĚHU (Funguje jako vaše JavaScript UI) --
% Pokud je kód prázdný, robot skončil.
run_ui_loop([], FinalWorld, Step) :-
    format('~nKROK ~w: Konec programu!~n', [Step]),
    writeln('Konečný svět: ' : FinalWorld),
    writeln('OK.').

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
	( WorldChange = world_change(KarelOut, null) ; world(KarelOut, _W, _B) = CurrentWorld ),
        append(ExpandedAST, Rest, NextAST),
        run_ui_loop(NextAST, world(KarelOut, [], []), NextStep)
    ;   writeln('❌ EXEKUCE SELHALA (Náraz do zdi / Neznámý příkaz)'),
        fail
    ).

