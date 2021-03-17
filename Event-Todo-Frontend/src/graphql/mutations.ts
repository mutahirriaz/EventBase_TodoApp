/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const addTodo = /* GraphQL */ `
  mutation AddTodo($todo: String!) {
    addTodo(todo: $todo) {
      result
    }
  }
`;
export const deleteTodo = /* GraphQL */ `
  mutation DeleteTodo($id: String!) {
    deleteTodo(id: $id) {
      result
    }
  }
`;
export const updateTodo = /* GraphQL */ `
  mutation UpdateTodo($todo: String!, $id: String!) {
    updateTodo(todo: $todo, id: $id) {
      result
    }
  }
`;
