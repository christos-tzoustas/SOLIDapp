import { CryptoUUID } from "./modules/uuid.js";
import { Todo } from "./modules/todo.js";
import { ImmutableState } from "./modules/state.js";
import { LocalStoragePersistence, } from "./modules/persistence.js";
import { getElementbyId } from "./modules/utils.js";
class App {
    root;
    addBtn;
    input;
    todoList;
    doneList;
    stateHandler;
    UUIDGenerator;
    statePersistence;
    saveBtn;
    loadBtn;
    constructor({ root, addBtn, input, doneList, todoList, saveBtn, loadBtn, stateHandler, UUIDGenerator, statePersistence, }) {
        this.root = root;
        this.addBtn = addBtn;
        this.input = input;
        this.todoList = todoList;
        this.doneList = doneList;
        this.stateHandler = stateHandler;
        this.UUIDGenerator = UUIDGenerator;
        this.statePersistence = statePersistence;
        this.saveBtn = saveBtn;
        this.loadBtn = loadBtn;
        this.initiate();
    }
    initiate() {
        this.addBtn.addEventListener("click", () => {
            const userInput = this.input.value;
            if (userInput) {
                const todo = new Todo(userInput, new Date(), this.UUIDGenerator.createRandomUUID());
                this.stateHandler.addTodo(todo);
                this.addTodo(todo);
            }
        });
        this.saveBtn.addEventListener("click", () => {
            this.statePersistence.save(this.stateHandler.state);
        });
        this.loadBtn.addEventListener("click", () => this.loadState());
    }
    async loadState() {
        const loadedState = await this.statePersistence.load();
        console.log({ loadedState });
        if (loadedState) {
            this.stateHandler.state = loadedState;
            this.synchronizeHTMLWithLoadedState(loadedState);
        }
    }
    synchronizeHTMLWithLoadedState(state) {
        this.todoList.innerHTML = "";
        this.doneList.innerHTML = "";
        [...state.completeTodos, ...state.incompleteTodos].forEach((todo) => this.addTodo(todo));
    }
    addTodo(todo) {
        const { todoLi, deleteSpan, completeSpan } = this.generateTodoHTML(todo);
        if (todo.status === "incomplete") {
            this.todoList.appendChild(todoLi);
        }
        else {
            this.doneList.appendChild(todoLi);
        }
        deleteSpan.addEventListener("click", () => {
            const todoInState = this.stateHandler.findTodo("id", todo.id);
            this.removeTodo(todoInState);
        });
        completeSpan.addEventListener("click", () => {
            const todoInState = this.stateHandler.findTodo("id", todo.id);
            this.toggleDoneStatus(todoInState);
        });
    }
    generateTodoHTML(todo) {
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
    removeTodo(todo) {
        const todoLi = document.querySelector(`[data-id="${todo.id}"]`);
        if (todo.status === "complete") {
            this.doneList.removeChild(todoLi);
        }
        else {
            this.todoList.removeChild(todoLi);
        }
        this.stateHandler.removeTodo(todo);
    }
    toggleDoneStatus(todo) {
        const li = document.querySelector(`[data-id="${todo.id}"]`);
        li?.classList.toggle("done", todo.status === "incomplete");
        if (todo.status === "incomplete") {
            this.todoList.removeChild(li);
            this.doneList.append(li);
            this.stateHandler.markAsDone(todo);
        }
        else {
            this.doneList.removeChild(li);
            this.todoList.append(li);
            this.stateHandler.markAsTodo(todo);
        }
    }
}
new App({
    root: getElementbyId("root"),
    addBtn: getElementbyId("addBtn"),
    input: getElementbyId("input"),
    todoList: getElementbyId("todoList"),
    doneList: getElementbyId("doneList"),
    saveBtn: getElementbyId("saveBtn"),
    loadBtn: getElementbyId("loadBtn"),
    stateHandler: new ImmutableState(),
    UUIDGenerator: new CryptoUUID(),
    statePersistence: new LocalStoragePersistence(),
});
