/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type Event = {
  __typename: "Event",
  result?: string,
};

export type Todos = {
  __typename: "Todos",
  id?: string,
  todo?: string,
};

export type AddTodoMutationVariables = {
  todo?: string,
};

export type AddTodoMutation = {
  addTodo?:  {
    __typename: "Event",
    result: string,
  } | null,
};

export type DeleteTodoMutationVariables = {
  id?: string,
};

export type DeleteTodoMutation = {
  deleteTodo?:  {
    __typename: "Event",
    result: string,
  } | null,
};

export type UpdateTodoMutationVariables = {
  todo?: string,
  id?: string,
};

export type UpdateTodoMutation = {
  updateTodo?:  {
    __typename: "Event",
    result: string,
  } | null,
};

export type GetTodosQuery = {
  getTodos?:  Array< {
    __typename: "Todos",
    id: string,
    todo: string,
  } | null > | null,
};
