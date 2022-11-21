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
    function Todo(description) {
        this.description = description;
        this.status = "incomplete";
        this.date = new Date();
        this.id = new cryptoUUID().createRandomUUID();
        new ConsoleLogger().log(this);
    }
    return Todo;
}());
var ConsoleLogger = /** @class */ (function () {
    function ConsoleLogger() {
    }
    ConsoleLogger.prototype.log = function (todo) {
        console.log("The todo with id \"".concat(todo.id, "\" and description \"").concat(todo.description, "\" was just added in the ").concat(todo.status === "complete" ? "todo" : "done", " pile"));
    };
    return ConsoleLogger;
}());
var cryptoUUID = /** @class */ (function () {
    function cryptoUUID() {
    }
    cryptoUUID.prototype.createRandomUUID = function () {
        return crypto.randomUUID();
    };
    return cryptoUUID;
}());
var stackOverflowUUID = /** @class */ (function () {
    function stackOverflowUUID() {
    }
    stackOverflowUUID.prototype.createRandomUUID = function () {
        return this.generateUUID();
    };
    stackOverflowUUID.prototype.generateUUID = function () {
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
    return stackOverflowUUID;
}());
var BasicStateHandler = /** @class */ (function () {
    function BasicStateHandler() {
        this.completeTodos = [];
        this.incompleteTodos = [];
    }
    BasicStateHandler.prototype.addTodo = function (description) {
        var todo = new Todo(description);
        this.completeTodos = __spreadArray(__spreadArray([], this.completeTodos, true), [todo], false);
        return todo;
    };
    BasicStateHandler.prototype.removeTodo = function (todo) {
        this.completeTodos = this.completeTodos.filter(function (completeTodo) { return completeTodo.id !== todo.id; });
        this.incompleteTodos = this.incompleteTodos.filter(function (incompleteTodo) { return incompleteTodo.id !== todo.id; });
        return todo;
    };
    BasicStateHandler.prototype.markAsDone = function (todo) {
        this.incompleteTodos = this.incompleteTodos.filter(function (incompleteTodo) { return incompleteTodo.id !== todo.id; });
        this.completeTodos = __spreadArray(__spreadArray([], this.completeTodos, true), [todo], false);
        return todo;
    };
    BasicStateHandler.prototype.markAsTodo = function (todo) {
        this.completeTodos = this.completeTodos.filter(function (incompleteTodo) { return incompleteTodo.id !== todo.id; });
        this.incompleteTodos = __spreadArray(__spreadArray([], this.incompleteTodos, true), [todo], false);
        return todo;
    };
    return BasicStateHandler;
}());
var App = /** @class */ (function () {
    function App(_a) {
        var root = _a.root, addBtn = _a.addBtn, input = _a.input, doneList = _a.doneList, todoList = _a.todoList, stateHandler = _a.stateHandler;
        this.root = this.getElementbyId(root);
        this.addBtn = this.getElementbyId(addBtn);
        this.input = this.getElementbyId(input);
        this.todoList = this.getElementbyId(todoList);
        this.doneList = this.getElementbyId(doneList);
        this.stateHandler = stateHandler;
        this.initiate();
    }
    App.prototype.getElementbyId = function (id) {
        return document.querySelector("#".concat(id));
    };
    App.prototype.initiate = function () {
        var _this = this;
        this.addBtn.addEventListener("click", function () {
            var userInput = _this.input.value;
            if (userInput) {
                var todo = _this.stateHandler.addTodo(userInput);
                _this.addTodoHTML(todo);
            }
        });
    };
    App.prototype.addTodoHTML = function (todo) {
        var _this = this;
        var li = document.createElement("li");
        li.textContent = todo.description;
        var span = document.createElement("span");
        span.textContent = " [X]";
        span.style.cursor = "pointer";
        li.append(span);
        li.dataset.id = todo.id;
        this.todoList.appendChild(li);
        span.addEventListener("click", function () { return _this.removeTodoHTML(todo); });
    };
    App.prototype.removeTodoHTML = function (todo) {
        var completeTodo = this.doneList.querySelector("[data-id=\"".concat(todo.id, "\"]"));
        var incompleteTodo = this.todoList.querySelector("[data-id=\"".concat(todo.id, "\"]"));
        if (completeTodo) {
            this.doneList.removeChild(completeTodo);
        }
        else if (incompleteTodo) {
            this.todoList.removeChild(incompleteTodo);
        }
        else {
            throw new Error("No todo found to remove!");
        }
    };
    return App;
}());
new App({
    root: "root",
    addBtn: "addBtn",
    input: "input",
    todoList: "todo",
    doneList: "done",
    stateHandler: new BasicStateHandler(),
});
