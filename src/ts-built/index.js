// TODO
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var Todo = /** @class */ (function () {
    function Todo(description, date, UUID) {
        this.description = description;
        this.status = "incomplete";
        this.date = date;
        this.id = UUID;
    }
    return Todo;
}());
// LOGGER
var ConsoleLogger = /** @class */ (function () {
    function ConsoleLogger() {
    }
    ConsoleLogger.log = function (todo, operation) {
        console.log("The todo with id \"".concat(todo.id, "\" and description \"").concat(todo.description, "\" was just ").concat(operation));
    };
    return ConsoleLogger;
}());
var CryptoUUID = /** @class */ (function () {
    function CryptoUUID() {
    }
    CryptoUUID.prototype.createRandomUUID = function () {
        return crypto.randomUUID();
    };
    return CryptoUUID;
}());
var StackOverflowUUID = /** @class */ (function () {
    function StackOverflowUUID() {
    }
    StackOverflowUUID.prototype.createRandomUUID = function () {
        return this.generateUUID();
    };
    StackOverflowUUID.prototype.generateUUID = function () {
        var d = new Date().getTime(); //Timestamp
        var d2 = (typeof performance !== "undefined" &&
            performance.now &&
            performance.now() * 1000) ||
            0; //Time in microseconds since page-load or 0 if unsupported
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = Math.random() * 16; //random number between 0 and 16
            if (d > 0) {
                //Use timestamp until depleted
                r = (d + r) % 16 | 0;
                d = Math.floor(d / 16);
            }
            else {
                //Use microseconds since page-load if supported
                r = (d2 + r) % 16 | 0;
                d2 = Math.floor(d2 / 16);
            }
            return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        });
    };
    return StackOverflowUUID;
}());
var BasicStateHandler = /** @class */ (function () {
    function BasicStateHandler() {
        this.state = {
            completeTodos: [],
            incompleteTodos: [],
        };
    }
    BasicStateHandler.prototype.reducer = function (_a) {
        var type = _a.type, payload = _a.payload;
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
                console.error("could not match action type ".concat(type, " for todo with id ").concat(payload.id, "}"));
        }
        ConsoleLogger.log(payload, type);
    };
    BasicStateHandler.prototype.addTodo = function (todo) {
        this.state.incompleteTodos = __spreadArray(__spreadArray([], this.state.incompleteTodos, true), [todo], false);
        return todo;
    };
    BasicStateHandler.prototype.removeTodo = function (todo) {
        this.state.completeTodos = this.state.completeTodos.filter(function (completeTodo) { return completeTodo.id !== todo.id; });
        this.state.incompleteTodos = this.state.incompleteTodos.filter(function (incompleteTodo) { return incompleteTodo.id !== todo.id; });
        return todo;
    };
    BasicStateHandler.prototype.markAsDone = function (todo) {
        todo.status = "complete";
        this.state.incompleteTodos = this.state.incompleteTodos.filter(function (incompleteTodo) { return incompleteTodo.id !== todo.id; });
        this.state.completeTodos = __spreadArray(__spreadArray([], this.state.completeTodos, true), [todo], false);
        return todo;
    };
    BasicStateHandler.prototype.markAsTodo = function (todo) {
        todo.status = "incomplete";
        this.state.completeTodos = this.state.completeTodos.filter(function (completeTodo) { return completeTodo.id !== todo.id; });
        this.state.incompleteTodos = __spreadArray(__spreadArray([], this.state.incompleteTodos, true), [todo], false);
        return todo;
    };
    return BasicStateHandler;
}());
var App = /** @class */ (function () {
    function App(_a) {
        var root = _a.root, addBtn = _a.addBtn, input = _a.input, doneList = _a.doneList, todoList = _a.todoList, stateHandler = _a.stateHandler, UUIDGenerator = _a.UUIDGenerator, statePersistence = _a.statePersistence;
        this.root = this.getElementbyId(root);
        this.addBtn = this.getElementbyId(addBtn);
        this.input = this.getElementbyId(input);
        this.todoList = this.getElementbyId(todoList);
        this.doneList = this.getElementbyId(doneList);
        this.stateHandler = stateHandler;
        this.UUIDGenerator = UUIDGenerator;
        this.statePersistence = statePersistence;
        // temporary
        this.saveBtn = this.getElementbyId("save");
        this.initiate();
    }
    App.prototype.getElementbyId = function (id) {
        return document.querySelector("#".concat(id));
    };
    App.prototype.initiate = function () {
        var _this = this;
        // check if any state is saved
        // basically run the load function from persistence clss
        var loadedState = this.statePersistence.load();
        console.log({ loadedState: loadedState });
        if (loadedState) {
            this.stateHandler.state = loadedState;
            // need to also have a load function for synchronizing html
            // with the loaded state
            this.synchronizeHTMLWithLoadedState(loadedState);
        }
        this.addBtn.addEventListener("click", function () {
            var userInput = _this.input.value;
            if (userInput) {
                var todo = new Todo(userInput, new Date(), _this.UUIDGenerator.createRandomUUID());
                _this.stateHandler.reducer({ type: "add", payload: todo });
                _this.addTodo(todo);
            }
        });
        this.saveBtn.addEventListener("click", function () {
            _this.statePersistence.save(_this.stateHandler.state);
        });
    };
    App.prototype.synchronizeHTMLWithLoadedState = function (state) {
        var _this = this;
        __spreadArray(__spreadArray([], state.completeTodos, true), state.incompleteTodos, true).forEach(function (todo) {
            return _this.addTodo(todo);
        });
    };
    App.prototype.addTodo = function (todo) {
        var _this = this;
        var _a = this.generateTodoHTML(todo), todoLi = _a.todoLi, deleteSpan = _a.deleteSpan, completeSpan = _a.completeSpan;
        if (todo.status === "incomplete") {
            this.todoList.appendChild(todoLi);
        }
        else {
            this.doneList.appendChild(todoLi);
        }
        deleteSpan.addEventListener("click", function () { return _this.removeTodo(todo); });
        completeSpan.addEventListener("click", function () { return _this.toggleDoneStatus(todo); });
    };
    App.prototype.generateTodoHTML = function (todo) {
        var todoLi = document.createElement("li");
        todoLi.textContent = todo.description;
        var deleteSpan = document.createElement("span");
        deleteSpan.textContent = " [X]";
        deleteSpan.style.cursor = "pointer";
        var completeSpan = document.createElement("span");
        completeSpan.textContent = " [done]";
        completeSpan.style.cursor = "pointer";
        todoLi.append(completeSpan, deleteSpan);
        todoLi.dataset.id = todo.id;
        todoLi.classList.toggle("done", todo.status === "complete");
        return { todoLi: todoLi, deleteSpan: deleteSpan, completeSpan: completeSpan };
    };
    App.prototype.removeTodo = function (todo) {
        var todoLi = document.querySelector("[data-id=\"".concat(todo.id, "\"]"));
        if (todo.status === "complete") {
            this.doneList.removeChild(todoLi);
        }
        else {
            this.todoList.removeChild(todoLi);
        }
        this.stateHandler.reducer({ type: "remove", payload: todo });
    };
    App.prototype.toggleDoneStatus = function (todo) {
        var li = document.querySelector("[data-id=\"".concat(todo.id, "\"]"));
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
        li === null || li === void 0 ? void 0 : li.classList.toggle("done", todo.status === "complete");
    };
    return App;
}());
var LocalStoragePersistence = /** @class */ (function () {
    function LocalStoragePersistence() {
    }
    LocalStoragePersistence.prototype.save = function (state) {
        console.log("will save", state);
        localStorage.setItem("todoState", JSON.stringify(state));
    };
    LocalStoragePersistence.prototype.load = function () {
        var todoState = localStorage.getItem("todoState");
        return JSON.parse(todoState);
    };
    return LocalStoragePersistence;
}());
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
