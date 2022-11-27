import { Todo } from "./todo.js";
import { ConsoleLogger } from "./logger.js";

// STATE
type State = {
  completeTodos: Todo[];
  incompleteTodos: Todo[];
};

type StateAction = {
  type: "add" | "remove" | "done" | "undo";
  payload: Todo;
};

interface StateInterface {
  state: State;
  reducer: (action: StateAction) => void;
  addTodo: (todo: Todo) => Todo;
  removeTodo: (todo: Todo) => Todo;
  markAsDone: (todo: Todo) => Todo;
  markAsTodo: (todo: Todo) => Todo;
}

class BasicState implements StateInterface {
  state: State = {
    completeTodos: [],
    incompleteTodos: [],
  };

  reducer({ type, payload }: { type: string; payload: Todo }) {
    switch (type) {
      case "add":
        this.addTodo(payload);
        break;
      case "remove":
        this.removeTodo(payload);
        break;
      case "done":
        this.markAsDone(payload);
        break;
      case "undo":
        this.markAsTodo(payload);
        break;
      default:
        console.error(
          `could not match action type ${type} for todo with id ${payload.id}}`
        );
    }

    ConsoleLogger.log(payload, type);
  }

  addTodo(todo: Todo) {
    this.state.incompleteTodos = [...this.state.incompleteTodos, todo];
    return todo;
  }
  removeTodo(todo: Todo) {
    this.state.completeTodos = this.state.completeTodos.filter(
      (completeTodo) => completeTodo.id !== todo.id
    );
    this.state.incompleteTodos = this.state.incompleteTodos.filter(
      (incompleteTodo) => incompleteTodo.id !== todo.id
    );
    return todo;
  }
  markAsDone(todo: Todo) {
    todo.status = "complete";
    this.state.incompleteTodos = this.state.incompleteTodos.filter(
      (incompleteTodo) => incompleteTodo.id !== todo.id
    );
    this.state.completeTodos = [...this.state.completeTodos, todo];
    return todo;
  }
  markAsTodo(todo: Todo) {
    todo.status = "incomplete";
    this.state.completeTodos = this.state.completeTodos.filter(
      (completeTodo) => completeTodo.id !== todo.id
    );
    this.state.incompleteTodos = [...this.state.incompleteTodos, todo];
    return todo;
  }
}

export { StateInterface, BasicState };
