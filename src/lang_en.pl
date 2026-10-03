% Vocabulary: English
keyword(krok, step).
keyword(vlevo, left).
keyword(poloz, put).
keyword(zvedni, pick).
keyword(opakuj, repeat).
keyword(kdyz, if).
keyword(jinak, else).
keyword(dokud, while).
keyword(def, define).
keyword(je, is).
keyword(neni, not).
keyword(zed, wall).
keyword(znacka, beeper).
keyword(na, facing).
keyword(sever, north).
keyword(jih, south).
keyword(vychod, east).
keyword(zapad, west).
keyword(lsquare, lsquare).
keyword(rsquare, rsquare).

% Context denotations: English
context_denotation(main, 'main program').
context_denotation(def(Token, Name), Msg) :-
    atomic_list_concat(['definition "', Token, ' ', Name, ' [ ... ]"'], Msg).
context_denotation(opakuj(Token, N), Msg) :-
    atomic_list_concat(['loop "', Token, ' ', N, ' [ ... ]"'], Msg).
context_denotation(kdyz(Token), Msg) :-
    atomic_list_concat(['branch "', Token, ' [ ... ]"'], Msg).
context_denotation(jinak(Token), Msg) :-
    atomic_list_concat(['branch "', Token, ' [ ... ]"'], Msg).
context_denotation(dokud(Token), Msg) :-
    atomic_list_concat(['loop "', Token, ' [ ... ]"'], Msg).
context_denotation(predicate(Token), Msg) :-
    atomic_list_concat(['condition after "', Token, '"'], Msg).
context_denotation(sensor(Token), Msg) :-
    atomic_list_concat(['test after "', Token, '"'], Msg).
context_denotation(direction(Token), Msg) :-
    atomic_list_concat(['direction after "', Token, '"'], Msg).

% Dynamic Error Messages Dictionary: English
error_msg(expected_kw(ExpectedToken, FoundToken), Msg) :-
    atomic_list_concat(['Expected "', ExpectedToken, '", found "', FoundToken, '"'], Msg).
error_msg(eof_expected_kw(ExpectedToken), Msg) :-
    atomic_list_concat(['Unexpected end of program. Expected "', ExpectedToken, '"'], Msg).
error_msg(unexpected_token_after_eof(ExtraToken), Msg) :-
    atomic_list_concat(['Unexpected token "', ExtraToken, '" after end of program'], Msg).
error_msg(unexpected_token(BadToken), Msg) :-
    atomic_list_concat(['Unexpected token "', BadToken, '"'], Msg).
error_msg(missing_block_end, 'Unexpected end of program. Missing "]" block terminator').
error_msg(routine_name_keyword(FoundKw), Msg) :-
    atomic_list_concat(['Routine name expected, keyword "', FoundKw, '" found'], Msg).
error_msg(eof_routine_name, 'Unexpected end of program. Expected routine name.').
error_msg(expected_number(FoundToken), Msg) :-
    atomic_list_concat(['Expected count number for loop, found "', FoundToken, '"'], Msg).
error_msg(eof_expected_number, 'Unexpected end of program. Expected count number for loop.').
error_msg(expected_predicate(FoundToken), Msg) :-
    atomic_list_concat(['Expected condition (e.g. "is wall", "not beeper"), found "', FoundToken, '"'], Msg).
error_msg(eof_expected_predicate, 'Unexpected end of program. Expected condition.').
error_msg(expected_sensor(FoundToken), Msg) :-
    atomic_list_concat(['Expected sensor condition (e.g. wall, beeper, facing ...), found "', FoundToken, '"'], Msg).
error_msg(eof_expected_sensor, 'Unexpected end of program. Expected sensor condition.').
error_msg(expected_direction(FoundToken), Msg) :-
    atomic_list_concat(['Expected direction (e.g. north, east, south, west), found "', FoundToken, '"'], Msg).
error_msg(eof_expected_direction, 'Unexpected end of program. Expected direction.').
error_msg(unknown_routine(Name), Msg) :-
    atomic_list_concat(['Unknown routine: "', Name, '"'], Msg).
error_msg(wall_collision, 'CRASH! Hit a wall!').
error_msg(no_beeper, 'No beeper under robot!').

