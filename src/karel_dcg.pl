% -*- mode: prolog -*-
:- use_module(library(lists)).

atom_number(Atom, Number) :- atom_chars(Atom, Chars), number_chars(Number, Chars).
member(H, [H|_]).
member(H, [_|Tail]) :- member(H, Tail).

writeln(X) :- write(X), nl.
format(Format, _Args) :- write(Format), nl.

% ==========================================
% KAREL PARSER
% ==========================================

% Throw structured error with context breadcrumbs list and message
throw_syntax_error(Context, ErrorTerm) :-
    context_breadcrumbs(Context, Breadcrumbs),
    error_msg(ErrorTerm, Msg),
    throw(error(syntax, Breadcrumbs, Msg)).

throw_syntax_error(ErrorTerm) :-
    throw_syntax_error([], ErrorTerm).

throw_runtime_error(ErrorTerm) :-
    error_msg(ErrorTerm, Msg),
    throw(error(runtime, [], Msg)).

% Breadcrumb context constructor: from outermost (root) to innermost (leaf)
context_breadcrumbs([], [MainMsg]) :-
    context_denotation(main, MainMsg).
context_breadcrumbs([Ctx|Rest], Breadcrumbs) :-
    context_breadcrumbs(Rest, RestBreadcrumbs),
    context_denotation(Ctx, CtxMsg),
    append(RestBreadcrumbs, [CtxMsg], Breadcrumbs).

% DCG terminal
terminal(X, [X|Rest], Rest).

% Lexical mapping (allows easy language mutations)
kw(Internal, Token) --> terminal(Token), { keyword(Internal, Token) }.

expect_kw(Internal, Token, _Context) --> kw(Internal, Token), !.
expect_kw(Internal, Token, Context) --> terminal(BadToken), !,
    { keyword(Internal, Token),
      throw_syntax_error(Context, expected_kw(Token, BadToken)) }.
expect_kw(Internal, Token, Context) --> [], 
    { keyword(Internal, Token),
      throw_syntax_error(Context, eof_expected_kw(Token)) }.

expect_kw(Internal, Token) --> expect_kw(Internal, Token, []).

% list concatenation
seq([H|Tail]) --> terminal(H), !, seq(Tail).
seq([]) --> [].

append(L1, L2, L1_L2) :- seq(L1, L1_L2, L2).


parse_source(SourceAtoms, Code, DefsTerms) :-
    phrase(program(DefsTerms, Code), SourceAtoms).

% program(Routines, AST) --> lines(AST)
program(DefsTerm, CodeTerm) --> definitions(DefsTerm), commands(CodeTerm, []), expect_eof.

expect_eof --> [].
expect_eof --> terminal(ExtraToken),
    { throw_syntax_error(unexpected_token_after_eof(ExtraToken)) }.

definitions([D|Rest]) --> define(D), !, definitions(Rest).
definitions([]) --> [].

% Context-aware commands list parsing
commands([], Context) --> peek_block_end(Context), !.
commands([C|Rest], Context) --> command(C, Context), !, commands(Rest, Context).
commands(_, Context) --> terminal(BadToken),
    { throw_syntax_error(Context, unexpected_token(BadToken)) }.

peek_rsquare([rsquare|Rest], [rsquare|Rest]).
is_eof([], []).

% Peeking block delimiters based on context
peek_block_end([_|_])   --> peek_rsquare, !.
peek_block_end([])      --> is_eof, !.
peek_block_end(Context) --> is_eof, !,
    { throw_syntax_error(Context, missing_block_end) }.

define(routine(Name, AST)) -->
    kw(def, DefToken), !,
    expect_routine_name(Name),
    expect_kw(lsquare, _1, [def(DefToken, Name)]),
    commands(AST, [def(DefToken, Name)]),
    expect_kw(rsquare, _2, [def(DefToken, Name)]).

routine_name(Name) --> terminal(Name), {\+ keyword(_, Name)}.

expect_routine_name(Name) --> routine_name(Name), !.
expect_routine_name(Name) --> kw(_, Name), !,
    { throw_syntax_error(routine_name_keyword(Name)) }.
expect_routine_name(_) --> [],
    { throw_syntax_error(eof_routine_name) }.

command(CMD, _Context) --> builtin_command(CMD), !.
command(CMD, Context)  --> abstract_command(CMD, Context), !.
command(CMD, _Context) --> routine_application(CMD), !.

builtin_command(builtin(krok, Token)) --> kw(krok, Token).
builtin_command(builtin(vlevo, Token)) --> kw(vlevo, Token).
builtin_command(builtin(poloz, Token)) --> kw(poloz, Token).
builtin_command(builtin(zvedni, Token)) --> kw(zvedni, Token).
routine_application(routine(Name)) --> routine_name(Name).

abstract_command(abstract(opakuj, Token, N, AST), Context) -->
    kw(opakuj, Token), !,
    expect_number(N, [opakuj(Token, N)|Context]),
    expect_kw(lsquare, _1, [opakuj(Token, N)|Context]),
    commands(AST, [opakuj(Token, N)|Context]),
    expect_kw(rsquare, _2, [opakuj(Token, N)|Context]).

abstract_command(abstract(kdyz, Token, Pred, ASTTrue, ASTFalse), Context) -->
    kw(kdyz, Token), !,
    expect_predicate(Pred, [predicate(Token) | Context]),
    expect_kw(lsquare, _1, [kdyz(Token)|Context]),
    commands(ASTTrue, [kdyz(Token)|Context]),
    expect_kw(rsquare, _2, [kdyz(Token)|Context]),
    else_part(ASTFalse, Context).

abstract_command(abstract(dokud, Token, Pred, AST), Context) -->
    kw(dokud, Token), !,
    expect_predicate(Pred, [predicate(Token) | Context]),
    expect_kw(lsquare, _1, [dokud(Token)|Context]),
    commands(AST, [dokud(Token)|Context]),
    expect_kw(rsquare, _2, [dokud(Token)|Context]).

else_part(ASTFalse, Context) -->
    kw(jinak, Token), !,
    expect_kw(lsquare, _1, [jinak(Token)|Context]),
    commands(ASTFalse, [jinak(Token)|Context]),
    expect_kw(rsquare, _2, [jinak(Token)|Context]).
else_part([], _Context) --> [].

expect_number(N, _Context) --> terminal(N_Str), { atom_number(N_Str, N) }, !.
expect_number(_, Context) --> terminal(BadToken), !,
    { throw_syntax_error(Context, expected_number(BadToken)) }.
expect_number(_, Context) --> [],
    { throw_syntax_error(Context, eof_expected_number) }.
expect_number(N) --> expect_number(N, []).

expect_predicate(Pred, Context) --> predicate(Pred, Context), !.
expect_predicate(_, Context) --> terminal(BadToken), !,
    { throw_syntax_error(Context, expected_predicate(BadToken)) }.
expect_predicate(_, Context) --> [],
    { throw_syntax_error(Context, eof_expected_predicate) }.
expect_predicate(Pred) --> expect_predicate(Pred, []).

predicate(Pred) --> predicate(Pred, []).
predicate(predicate(je, Token, P), Context) --> kw(je, Token), !, expect_sensor(P, [sensor(Token)|Context]).
predicate(predicate(neni, Token, P), Context) --> kw(neni, Token), !, expect_sensor(P, [sensor(Token)|Context]).

expect_sensor(P, Context) --> sensor(P, Context), !.
expect_sensor(_, Context) --> terminal(BadToken), !,
    { throw_syntax_error(Context, expected_sensor(BadToken)) }.
expect_sensor(_, Context) --> [],
    { throw_syntax_error(Context, eof_expected_sensor) }.
expect_sensor(P) --> expect_sensor(P, []).

sensor(P) --> sensor(P, []).
sensor(sensor(zed, Token), _Context) --> kw(zed, Token).
sensor(sensor(znacka, Token), _Context) --> kw(znacka, Token).
sensor(sensor(Dir, [TokenNa, TokenDir]), Context) -->
    kw(na, TokenNa), !,
    expect_direction(Dir, TokenDir, [direction(TokenNa)|Context]).

direction(sever, Token) --> kw(sever, Token).
direction(zapad, Token) --> kw(zapad, Token).
direction(jih, Token) --> kw(jih, Token).
direction(vychod, Token) --> kw(vychod, Token).

expect_direction(Dir, TokenDir, _Context) --> direction(Dir, TokenDir), !.
expect_direction(_, _, Context) --> terminal(BadToken), !,
    { throw_syntax_error(Context, expected_direction(BadToken)) }.
expect_direction(_, _, Context) --> [],
    { throw_syntax_error(Context, eof_expected_direction) }.




%=============== REDUCTIONS ==================

% karel(X, Y, Orient) ... karel(3, 2, sever)
% [wall(X1, Y1, sever | vychod)] ... [wall(5, 3, sever), wall(4, 3, vychod), ...]
% [beeper(X, Y, N)] ... [beeper(1, 2, 2), beeper(3, 4, 1), ...]
% simpleCommand | opakuj(N, [command]) ...

% reduce_step(WorldIn, TopCmd, Routines, WorldChange, Expansion)
% Expansion is [] when a builtin command is consumed, or a list of AST items to push onto stack.

reduce_step(WorldIn, Cmd, _Routines, WorldChange, []) :-
    is_atomic(Cmd), !, 
    execute_atomic(Cmd, WorldIn, WorldChange).

reduce_step(world(Karel, _Walls, _Beeps), abstract(opakuj, T, N, AST), _Routines, world_change(Karel, null), Expanded) :-
    N > 0, !,
    N1 is N - 1,
    append(AST, [abstract(opakuj, T, N1, AST)], Expanded).

reduce_step(world(Karel, _Walls, _Beeps), abstract(opakuj, _T, 0, _AST), _Routines, world_change(Karel, null), []) :- !.

reduce_step(world(Karel, _Walls, _Beeps), abstract(dokud, TDokud, Pred, AST), _Routines, world_change(Karel, null), [abstract(kdyz, TKdyz, Pred, Appended, [])]) :-
    !,
    append(AST, [abstract(dokud, TDokud, Pred, AST)], Appended),
    keyword(kdyz, TKdyz).

reduce_step(world(Karel, _Walls, _Beeps), abstract(kdyz, _TKdyz, 'TRUE', ASTTrue, _ASTFalse), _Routines, world_change(Karel, null), ASTTrue) :-
    !.

reduce_step(world(Karel, _Walls, _Beeps), abstract(kdyz, _TKdyz, 'FALSE', _ASTTrue, ASTFalse), _Routines, world_change(Karel, null), ASTFalse) :-
    !.

reduce_step(WorldIn, abstract(kdyz, TKdyz, Pred, ASTTrue, ASTFalse), _Routines, world_change(Karel, null), [abstract(kdyz, TKdyz, Outcome, ASTTrue, ASTFalse)]) :-
    \+ member(Pred, ['TRUE', 'FALSE']), !,
    world(Karel, _Walls, _Beeps) = WorldIn,
    ( eval_predicate(Pred, WorldIn) -> Outcome = 'TRUE' ; Outcome = 'FALSE' ).

reduce_step(world(Karel, _Walls, _Beeps), routine(Name), Routines, world_change(Karel, null), AST) :-
    member(routine(Name, AST), Routines), !.

reduce_step(world(_Karel, _Walls, _Beeps), routine(Name), Routines, _WorldChange, _Out) :-
    \+ member(routine(Name, _AST), Routines),
    throw_runtime_error(unknown_routine(Name)).

% reduce/5 for full AST list DCG/phrase compatibility
reduce(WorldIn, WorldChange, Routines, [Cmd|Rest], Out) :-
    reduce_step(WorldIn, Cmd, Routines, WorldChange, Expanded),
    append(Expanded, Rest, Out).


eval_predicate(predicate(je, _JeToken, sensor(zed, _ZedToken)), world(karel(X, Y, Dir), Walls, _Beep)) :-
    member(Dir, [sever, vychod]), member(wall(X, Y, Dir), Walls).

eval_predicate(predicate(je, _JeToken, sensor(zed, _ZedToken)), world(karel(X, Y, zapad), Walls, _Beep)) :-
    X1 is X - 1, member(wall(X1, Y, vychod), Walls).

eval_predicate(predicate(je, _JeToken, sensor(zed, _ZedToken)), world(karel(X, Y, jih), Walls, _Beep)) :-
    Y1 is Y - 1,
    member(wall(X, Y1, sever), Walls).

eval_predicate(predicate(je, _JeToken, sensor(znacka, _ZnackaToken)), world(karel(X, Y, _Dir), _Walls, Beeps)) :-
    member(beeper(X, Y, N), Beeps), N > 0.

eval_predicate(predicate(je, _JeToken, sensor(Dir, [_NaToken, _DirToken])), world(karel(_X, _Y, Dir), _Walls, _Beeps)).

eval_predicate(predicate(neni, _NeniToken, Sensor), World) :- \+ eval_predicate(predicate(je, nezalezi, Sensor), World).


is_atomic(builtin(_Internal, _Token)).

execute_atomic(builtin(krok, _), world(KarelIn, Walls, _Beeps), world_change(KarelOut, null)) :-
    move(KarelIn, KarelOut, Walls).
execute_atomic(builtin(vlevo, _), world(KarelIn, _Walls, _Beeps), world_change(KarelOut, null)) :-
    vlevo_(KarelIn, KarelOut).
execute_atomic(builtin(zvedni, _), world(Karel, _Walls, Beeps), world_change(Karel, [BeepIn, BeepOut])) :-
    zvedni_(Karel, Beeps, BeepIn, BeepOut).
execute_atomic(builtin(poloz, _), world(Karel, _Walls, Beeps), world_change(Karel, [BeepOut, BeepIn])) :-
    poloz_(Karel, Beeps, BeepOut, BeepIn).

move(karel(X, Y, sever), karel(X, Y2, sever), Walls) :- Y2 is Y + 1, Y2 =< 10, \+member(wall(X, Y, sever), Walls), !.
move(karel(X, Y, zapad), karel(X2, Y, zapad), Walls) :- X2 is X - 1, X2 >= 1, \+member(wall(X2, Y, vychod), Walls), !.
move(karel(X, Y, jih), karel(X, Y2, jih), Walls) :- Y2 is Y - 1, Y2 >= 1, \+member(wall(X, Y2, sever), Walls), !.
move(karel(X, Y, vychod), karel(X2, Y, vychod), Walls) :- X2 is X + 1, X2 =< 10, \+member(wall(X, Y, vychod), Walls), !.
move(karel(X, Y, _), karel(X, Y, _), _2) :- throw_runtime_error(wall_collision).

vlevo_(karel(X, Y, sever), karel(X, Y, zapad)).
vlevo_(karel(X, Y, zapad), karel(X, Y, jih)).
vlevo_(karel(X, Y, jih), karel(X, Y, vychod)).
vlevo_(karel(X, Y, vychod), karel(X, Y, sever)).

zvedni_(karel(X, Y, _Dir), BeepsIn, beeper(X, Y, N), beeper(X, Y, N1)) :- 
    member(beeper(X, Y, N), BeepsIn),
    N > 1, N1 is N - 1, !.
zvedni_(karel(X, Y, _Dir), Beepers, beeper(X, Y, 1), null) :- 
    member(beeper(X, Y, 1), Beepers), !.
zvedni_(_1, _2, _3, _4) :- throw_runtime_error(no_beeper).

poloz_(karel(X, Y, _Dir), Beepers, beeper(X, Y, N), beeper(X, Y, N1)) :- 
    member(beeper(X, Y, N), Beepers), !, 
    N1 is N + 1.
poloz_(karel(X, Y, _Dir), Beepers, null, beeper(X, Y, 1)) :- 
    \+member(beeper(X, Y, _), Beepers), !.
