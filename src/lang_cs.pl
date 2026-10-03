% Vocabulary: Czech
keyword(krok, krok).
keyword(vlevo, vlevo).
keyword(poloz, poloz).
keyword(zvedni, zvedni).
keyword(opakuj, opakuj).
keyword(kdyz, kdyz).
keyword(jinak, jinak).
keyword(dokud, dokud).
keyword(def, def).
keyword(def, definuj).
keyword(je, je).
keyword(neni, neni).
keyword(zed, zed).
keyword(znacka, znacka).
keyword(na, na).
keyword(sever, sever).
keyword(jih, jih).
keyword(vychod, vychod).
keyword(zapad, zapad).
keyword(lsquare, lsquare).
keyword(rsquare, rsquare).

% Context denotations: Czech
context_denotation(main, 'hlavní program').
context_denotation(def(Token, Name), Msg) :-
    atomic_list_concat(['definice "', Token, ' ', Name, ' [ ... ]"'], Msg).
context_denotation(opakuj(Token, N), Msg) :-
    atomic_list_concat(['cyklus "', Token, ' ', N, ' [ ... ]"'], Msg).
context_denotation(kdyz(Token), Msg) :-
    atomic_list_concat(['větev "', Token, ' [ ... ]"'], Msg).
context_denotation(jinak(Token), Msg) :-
    atomic_list_concat(['větev "', Token, ' [ ... ]"'], Msg).
context_denotation(dokud(Token), Msg) :-
    atomic_list_concat(['cyklus "', Token, ' [ ... ]"'], Msg).
context_denotation(predicate(Token), Msg) :-
    atomic_list_concat(['podmínka za "', Token, '"'], Msg).
context_denotation(sensor(Token), Msg) :-
    atomic_list_concat(['test za "', Token, '"'], Msg).
context_denotation(direction(Token), Msg) :-
    atomic_list_concat(['směr za "', Token, '"'], Msg).

% Dynamic Error Messages Dictionary: Czech
error_msg(expected_kw(ExpectedToken, FoundToken), Msg) :-
    atomic_list_concat(['Očekáváno "', ExpectedToken, '", nalezeno "', FoundToken, '"'], Msg).
error_msg(eof_expected_kw(ExpectedToken), Msg) :-
    atomic_list_concat(['Neočekávaný konec programu. Očekáváno "', ExpectedToken, '"'], Msg).
error_msg(unexpected_token_after_eof(ExtraToken), Msg) :-
    atomic_list_concat(['Neočekávaný symbol "', ExtraToken, '" za koncem programu'], Msg).
error_msg(unexpected_token(BadToken), Msg) :-
    atomic_list_concat(['Neočekávaný symbol "', BadToken, '"'], Msg).
error_msg(missing_block_end, 'Neočekávaný konec programu. Chybí ukončení bloku "]"').
error_msg(routine_name_keyword(FoundKw), Msg) :-
    atomic_list_concat(['Očekáván název procedury, nalezeno klíčové slovo "', FoundKw, '"'], Msg).
error_msg(eof_routine_name, 'Neočekávaný konec programu. Očekáván název procedury.').
error_msg(expected_number(FoundToken), Msg) :-
    atomic_list_concat(['Očekáváno číslo (počet opakování), nalezeno "', FoundToken, '"'], Msg).
error_msg(eof_expected_number, 'Neočekávaný konec programu. Očekáváno číslo (počet opakování).').
error_msg(expected_predicate(FoundToken), Msg) :-
    atomic_list_concat(['Očekávána podmínka (např. "je zed", "neni znacka"), nalezeno "', FoundToken, '"'], Msg).
error_msg(eof_expected_predicate, 'Neočekávaný konec programu. Očekávána podmínka.').
error_msg(expected_sensor(FoundToken), Msg) :-
    atomic_list_concat(['Očekáván senzor / test (např. zed, znacka, na ...), nalezeno "', FoundToken, '"'], Msg).
error_msg(eof_expected_sensor, 'Neočekávaný konec programu. Očekáván senzor / test.').
error_msg(expected_direction(FoundToken), Msg) :-
    atomic_list_concat(['Očekáván směr (např. sever, vychod, jih, zapad), nalezeno "', FoundToken, '"'], Msg).
error_msg(eof_expected_direction, 'Neočekávaný konec programu. Očekáván směr.').
error_msg(unknown_routine(Name), Msg) :-
    atomic_list_concat(['Neznámá procedura: "', Name, '"'], Msg).
error_msg(wall_collision, 'BUM! Narazil jsi do zdi!').
error_msg(no_beeper, 'Zadna znacka!').

