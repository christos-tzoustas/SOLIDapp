import { Todo } from "./todo.js";
import { ConsoleLogger } from "./logger.js";

// STATE
type State = {
  completeTodos: Todo[];
  incompleteTodos: Todo[];
};

interface StateInterface {
  state: State;
  findTodo: (queryProp: keyof Todo, queryValue: any) => Todo;
  addTodo: (todo: Todo) => void;
  removeTodo: (todo: Todo) => void;
  markAsDone: (todo: Todo) => void;
  markAsTodo: (todo: Todo) => void;
}

type ImmutableStateAction = {
  type: "add" | "remove" | "done" | "undo";
  payload: { todo: Todo };
};

type ImmutableStateReducer = (
  state: State,
  action: ImmutableStateAction
) => State;

class ImmutableState implements StateInterface {
  state: State = {
    completeTodos: [],
    incompleteTodos: [],
  };

  reducer: ImmutableStateReducer = function (state, { type, payload }) {
    ConsoleLogger.log(payload.todo, type);
    switch (type) {
      case "add": {
        const incompleteTodos = [...state.incompleteTodos, payload.todo];
        return { ...state, incompleteTodos };
      }
      case "remove": {
        const completeTodos = state.completeTodos.filter(
          (completeTodo) => completeTodo.id !== payload.todo.id
        );
        const incompleteTodos = state.incompleteTodos.filter(
          (incompleteTodo) => incompleteTodo.id !== payload.todo.id
        );
        return { ...state, completeTodos, incompleteTodos };
      }
      case "done": {
        const doneTodo: Todo = {
          ...payload.todo,
          status: "complete",
        };
        const incompleteTodos = state.incompleteTodos.filter(
          (incompleteTodo) => incompleteTodo.id !== doneTodo.id
        );
        const completeTodos = [...state.completeTodos, doneTodo];
        return {
          ...state,
          incompleteTodos,
          completeTodos,
        };
      }
      case "undo": {
        const undoneTodo: Todo = {
          ...payload.todo,
          status: "incomplete",
        };
        const completeTodos = state.completeTodos.filter(
          (completeTodo) => completeTodo.id !== undoneTodo.id
        );
        const incompleteTodos = [...this.state.incompleteTodos, undoneTodo];
        return { ...state, completeTodos, incompleteTodos };
      }
      default: {
        return state;
      }
    }
  };

  findTodo(queryProp: keyof Todo, queryValue: any) {
    const foundTodo: Todo = [
      ...this.state.completeTodos,
      ...this.state.incompleteTodos,
    ].find((todo) => todo[queryProp] === queryValue);

    return foundTodo;
  }

  addTodo(todo: Todo) {
    this.state = this.reducer(this.state, {
      type: "add",
      payload: { todo },
    });
  }
  removeTodo(todo: Todo) {
    this.state = this.reducer(this.state, {
      type: "remove",
      payload: { todo },
    });
  }
  markAsDone(todo: Todo) {
    this.state = this.reducer(this.state, {
      type: "done",
      payload: { todo },
    });
  }
  markAsTodo(todo: Todo) {
    this.state = this.reducer(this.state, {
      type: "undo",
      payload: { todo },
    });
  }
}

export { StateInterface, ImmutableState };
