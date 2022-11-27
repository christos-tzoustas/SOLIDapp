// LOGGER

import { Todo } from "./todo.js";

class ConsoleLogger {
  static log(todo: Todo, operation: string) {
    console.log(
      `The todo with id "${todo.id}" and description "${todo.description}" was just ${operation}`
    );
  }
}

export { ConsoleLogger };
