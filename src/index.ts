// TODO

interface Todo {
  description: string;
  status: "incomplete" | "complete";
  date: Date;
  id: ReturnType<UUIDInterface["createRandomUUID"]>;
}

class Todo {
  constructor(description) {
    this.description = description;
    this.status = "incomplete";
    this.date = new Date();
    this.id = new cryptoUUID().createRandomUUID();
    new ConsoleLogger().log(this);
  }
}

// LOGGER

interface LoggerInterface {
  log: (todo: Todo) => void;
}

class ConsoleLogger implements LoggerInterface {
  log(todo: Todo) {
    console.log(
      `The todo with id "${todo.id}" and description "${
        todo.description
      }" was just added in the ${
        todo.status === "complete" ? "todo" : "done"
      } pile`
    );
  }
}

// UUID

interface UUIDInterface {
  createRandomUUID: () => string;
}

class cryptoUUID implements UUIDInterface {
  createRandomUUID() {
    return crypto.randomUUID();
  }
}

class stackOverflowUUID implements UUIDInterface {
  createRandomUUID() {
    return this.generateUUID();
  }

  generateUUID() {
    var d = new Date().getTime(); //Timestamp
    var d2 =
      (typeof performance !== "undefined" &&
        performance.now &&
        performance.now() * 1000) ||
      0; //Time in microseconds since page-load or 0 if unsupported
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = Math.random() * 16; //random number between 0 and 16
        if (d > 0) {
          //Use timestamp until depleted
          r = (d + r) % 16 | 0;
          d = Math.floor(d / 16);
        } else {
          //Use microseconds since page-load if supported
          r = (d2 + r) % 16 | 0;
          d2 = Math.floor(d2 / 16);
        }
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      }
    );
  }
}

// STATE MANIPULATOR

interface StateHandlerInterface {
  completeTodos: Todo[];
  incompleteTodos: Todo[];
  addTodo: (description: Todo["description"]) => Todo;
  removeTodo: (todo: Todo) => Todo;
  markAsDone: (todo: Todo) => Todo;
  markAsTodo: (todo: Todo) => Todo;
}

class BasicStateHandler implements StateHandlerInterface {
  completeTodos: Todo[] = [];
  incompleteTodos: Todo[] = [];
  addTodo(description: Todo["description"]) {
    const todo = new Todo(description);
    this.completeTodos = [...this.completeTodos, todo];
    return todo;
  }
  removeTodo(todo: Todo) {
    this.completeTodos = this.completeTodos.filter(
      (completeTodo) => completeTodo.id !== todo.id
    );
    this.incompleteTodos = this.incompleteTodos.filter(
      (incompleteTodo) => incompleteTodo.id !== todo.id
    );
    return todo;
  }
  markAsDone(todo: Todo) {
    this.incompleteTodos = this.incompleteTodos.filter(
      (incompleteTodo) => incompleteTodo.id !== todo.id
    );
    this.completeTodos = [...this.completeTodos, todo];
    return todo;
  }
  markAsTodo(todo: Todo) {
    this.completeTodos = this.completeTodos.filter(
      (incompleteTodo) => incompleteTodo.id !== todo.id
    );
    this.incompleteTodos = [...this.incompleteTodos, todo];
    return todo;
  }
}

// // DOM MANIPULATOR

// interface DOMManipulatorInterface {

// }

// APP
interface AppOptions {
  root: string;
  addBtn: string;
  input: string;
  todoList: string;
  doneList: string;
  stateHandler: StateHandlerInterface;
}

interface App {
  root: HTMLElement;
  addBtn: HTMLButtonElement;
  input: HTMLInputElement;
  todoList: HTMLUListElement;
  doneList: HTMLUListElement;
  stateHandler: StateHandlerInterface;
}

class App {
  constructor({
    root,
    addBtn,
    input,
    doneList,
    todoList,
    stateHandler,
  }: AppOptions) {
    this.root = this.getElementbyId(root);
    this.addBtn = this.getElementbyId(addBtn) as HTMLButtonElement;
    this.input = this.getElementbyId(input) as HTMLInputElement;
    this.todoList = this.getElementbyId(todoList) as HTMLUListElement;
    this.doneList = this.getElementbyId(doneList) as HTMLUListElement;
    this.stateHandler = stateHandler;
    this.initiate();
  }

  getElementbyId(id: string) {
    return document.querySelector(`#${id}`) as HTMLElement;
  }

  initiate() {
    this.addBtn.addEventListener("click", () => {
      const userInput = this.input.value;

      if (userInput) {
        const todo = this.stateHandler.addTodo(userInput);
        this.addTodoHTML(todo);
      }
    });
  }

  addTodoHTML(todo: Todo) {
    const li = document.createElement("li");
    li.textContent = todo.description;
    const span = document.createElement("span");
    span.textContent = " [X]";
    span.style.cursor = "pointer";
    li.append(span);
    li.dataset.id = todo.id;
    this.todoList.appendChild(li);
    span.addEventListener("click", () => this.removeTodoHTML(todo));
  }

  removeTodoHTML(todo: Todo) {
    const completeTodo = this.doneList.querySelector(`[data-id="${todo.id}"]`);
    const incompleteTodo = this.todoList.querySelector(
      `[data-id="${todo.id}"]`
    );
    if (completeTodo) {
      this.doneList.removeChild(completeTodo);
    } else if (incompleteTodo) {
      this.todoList.removeChild(incompleteTodo);
    } else {
      throw new Error("No todo found to remove!");
    }
  }
}

new App({
  root: "root",
  addBtn: "addBtn",
  input: "input",
  todoList: "todo",
  doneList: "done",
  stateHandler: new BasicStateHandler(),
});
