import { CryptoUUID } from "./modules/uuid.js";
import { Todo } from "./modules/todo.js";
import { BasicState } from "./modules/state.js";
import { LocalStoragePersistence, } from "./modules/persistence.js";
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
    constructor({ rootId, addBtnId, inputId, doneListId, todoListId, saveBtnId, loadBtnId, stateHandler, UUIDGenerator, statePersistence, }) {
        this.root = this.getElementbyId(rootId);
        this.addBtn = this.getElementbyId(addBtnId);
        this.input = this.getElementbyId(inputId);
        this.todoList = this.getElementbyId(todoListId);
        this.doneList = this.getElementbyId(doneListId);
        this.stateHandler = stateHandler;
        this.UUIDGenerator = UUIDGenerator;
        this.statePersistence = statePersistence;
        this.saveBtn = this.getElementbyId(saveBtnId);
        this.loadBtn = this.getElementbyId(loadBtnId);
        this.initiate();
    }
    getElementbyId(id) {
        return document.querySelector(`#${id}`);
    }
    initiate() {
        this.addBtn.addEventListener("click", () => {
            const userInput = this.input.value;
            if (userInput) {
                const todo = new Todo(userInput, new Date(), this.UUIDGenerator.createRandomUUID());
                this.stateHandler.reducer({ type: "add", payload: todo });
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
        deleteSpan.addEventListener("click", () => this.removeTodo(todo));
        completeSpan.addEventListener("click", () => this.toggleDoneStatus(todo));
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
        this.stateHandler.reducer({ type: "remove", payload: todo });
    }
    toggleDoneStatus(todo) {
        const li = document.querySelector(`[data-id="${todo.id}"]`);
        if (todo.status === "incomplete") {
            this.todoList.removeChild(li);
            this.doneList.append(li);
            this.stateHandler.reducer({ type: "done", payload: todo });
        }
        else {
            this.doneList.removeChild(li);
            this.todoList.append(li);
            this.stateHandler.reducer({ type: "undo", payload: todo });
        }
        li?.classList.toggle("done", todo.status === "complete");
    }
}
new App({
    rootId: "root",
    addBtnId: "addBtn",
    inputId: "input",
    todoListId: "todo",
    doneListId: "done",
    saveBtnId: "save",
    loadBtnId: "load",
    stateHandler: new BasicState(),
    UUIDGenerator: new CryptoUUID(),
    statePersistence: new LocalStoragePersistence(),
});
