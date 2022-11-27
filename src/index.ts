// TODO

interface Todo {
  description: string;
  status: "incomplete" | "complete";
  date: Date;
  id: ReturnType<UUIDInterface["createRandomUUID"]>;
}

class Todo {
  constructor(description, date, UUID) {
    this.description = description;
    this.status = "incomplete";
    this.date = date;
    this.id = UUID;
  }
}

// LOGGER

class ConsoleLogger {
  static log(todo: Todo, operation: string) {
    console.log(
      `The todo with id "${todo.id}" and description "${todo.description}" was just ${operation}`
    );
  }
}

// UUID

interface UUIDInterface {
  createRandomUUID: () => string;
}

class CryptoUUID implements UUIDInterface {
  createRandomUUID() {
    return crypto.randomUUID();
  }
}

class StackOverflowUUID implements UUIDInterface {
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

type State = {
  completeTodos: Todo[];
  incompleteTodos: Todo[];
};

type StateAction = {
  type: "add" | "remove" | "done" | "undo";
  payload: Todo;
};

interface StateHandlerInterface {
  state: State;
  reducer: (action: StateAction) => void;
  addTodo: (todo: Todo) => Todo;
  removeTodo: (todo: Todo) => Todo;
  markAsDone: (todo: Todo) => Todo;
  markAsTodo: (todo: Todo) => Todo;
}

class BasicStateHandler implements StateHandlerInterface {
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

// APP
interface AppOptions {
  root: string;
  addBtn: string;
  input: string;
  todoList: string;
  doneList: string;
  stateHandler: StateHandlerInterface;
  UUIDGenerator: UUIDInterface;
  statePersistence: StatePersistence;
}

interface App {
  root: HTMLElement;
  addBtn: HTMLButtonElement;
  input: HTMLInputElement;
  todoList: HTMLUListElement;
  doneList: HTMLUListElement;
  stateHandler: StateHandlerInterface;
  UUIDGenerator: UUIDInterface;
  statePersistence: StatePersistence;
  // temporary
  saveBtn: HTMLButtonElement;
}

class App {
  constructor({
    root,
    addBtn,
    input,
    doneList,
    todoList,
    stateHandler,
    UUIDGenerator,
    statePersistence,
  }: AppOptions) {
    this.root = this.getElementbyId(root);
    this.addBtn = this.getElementbyId(addBtn) as HTMLButtonElement;
    this.input = this.getElementbyId(input) as HTMLInputElement;
    this.todoList = this.getElementbyId(todoList) as HTMLUListElement;
    this.doneList = this.getElementbyId(doneList) as HTMLUListElement;
    this.stateHandler = stateHandler;
    this.UUIDGenerator = UUIDGenerator;
    this.statePersistence = statePersistence;
    // temporary
    this.saveBtn = this.getElementbyId("save") as HTMLButtonElement;
    this.initiate();
  }

  getElementbyId(id: string) {
    return document.querySelector(`#${id}`) as HTMLElement;
  }

  initiate() {
    // check if any state is saved
    // basically run the load function from persistence clss
    const loadedState = this.statePersistence.load();
    console.log({ loadedState });
    if (loadedState) {
      this.stateHandler.state = loadedState;
      // need to also have a load function for synchronizing html
      // with the loaded state
      this.synchronizeHTMLWithLoadedState(loadedState);
    }
    this.addBtn.addEventListener("click", () => {
      const userInput = this.input.value;

      if (userInput) {
        const todo = new Todo(
          userInput,
          new Date(),
          this.UUIDGenerator.createRandomUUID()
        );
        this.stateHandler.reducer({ type: "add", payload: todo });
        this.addTodo(todo);
      }
    });

    this.saveBtn.addEventListener("click", () => {
      this.statePersistence.save(this.stateHandler.state);
    });
  }

  synchronizeHTMLWithLoadedState(state: StateHandlerInterface["state"]) {
    [...state.completeTodos, ...state.incompleteTodos].forEach((todo) =>
      this.addTodo(todo)
    );
  }

  addTodo(todo: Todo) {
    const { todoLi, deleteSpan, completeSpan } = this.generateTodoHTML(todo);
    if (todo.status === "incomplete") {
      this.todoList.appendChild(todoLi);
    } else {
      this.doneList.appendChild(todoLi);
    }
    deleteSpan.addEventListener("click", () => this.removeTodo(todo));
    completeSpan.addEventListener("click", () => this.toggleDoneStatus(todo));
  }

  generateTodoHTML(todo: Todo) {
    const todoLi = document.createElement("li");
    todoLi.textContent = todo.description;
    const deleteSpan = document.createElement("span");
    deleteSpan.textContent = " [X]";
    deleteSpan.style.cursor = "pointer";
    const completeSpan = document.createElement("span");
    completeSpan.textContent = " [done]";
    completeSpan.style.cursor = "pointer";
    todoLi.append(completeSpan, deleteSpan);
    todoLi.dataset.id = todo.id;
    todoLi.classList.toggle("done", todo.status === "complete");
    return { todoLi, deleteSpan, completeSpan };
  }

  removeTodo(todo: Todo) {
    const todoLi = document.querySelector(`[data-id="${todo.id}"]`);
    if (todo.status === "complete") {
      this.doneList.removeChild(todoLi);
    } else {
      this.todoList.removeChild(todoLi);
    }

    this.stateHandler.reducer({ type: "remove", payload: todo });
  }

  toggleDoneStatus(todo: Todo) {
    const li = document.querySelector(`[data-id="${todo.id}"]`);

    if (todo.status === "incomplete") {
      this.todoList.removeChild(li);
      this.doneList.append(li);
      this.stateHandler.reducer({ type: "done", payload: todo });
    } else {
      this.doneList.removeChild(li);
      this.todoList.append(li);
      this.stateHandler.reducer({ type: "undo", payload: todo });
    }

    li?.classList.toggle("done", todo.status === "complete");
  }
}

interface StatePersistence {
  save: (state: StateHandlerInterface["state"]) => void;
  load: () => StateHandlerInterface["state"];
}

class LocalStoragePersistence {
  save(state: StateHandlerInterface["state"]) {
    console.log(`will save`, state);
    localStorage.setItem("todoState", JSON.stringify(state));
  }

  load() {
    const todoState = localStorage.getItem("todoState");
    return JSON.parse(todoState);
  }
}

new App({
  root: "root",
  addBtn: "addBtn",
  input: "input",
  todoList: "todo",
  doneList: "done",
  stateHandler: new BasicStateHandler(),
  UUIDGenerator: new CryptoUUID(),
  statePersistence: new LocalStoragePersistence(),
});
