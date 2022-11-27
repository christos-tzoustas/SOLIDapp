import { ConsoleLogger } from "./logger.js";
class BasicState {
    state = {
        completeTodos: [],
        incompleteTodos: [],
    };
    reducer({ type, payload }) {
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
                console.error(`could not match action type ${type} for todo with id ${payload.id}}`);
        }
        ConsoleLogger.log(payload, type);
    }
    addTodo(todo) {
        this.state.incompleteTodos = [...this.state.incompleteTodos, todo];
        return todo;
    }
    removeTodo(todo) {
        this.state.completeTodos = this.state.completeTodos.filter((completeTodo) => completeTodo.id !== todo.id);
        this.state.incompleteTodos = this.state.incompleteTodos.filter((incompleteTodo) => incompleteTodo.id !== todo.id);
        return todo;
    }
    markAsDone(todo) {
        todo.status = "complete";
        this.state.incompleteTodos = this.state.incompleteTodos.filter((incompleteTodo) => incompleteTodo.id !== todo.id);
        this.state.completeTodos = [...this.state.completeTodos, todo];
        return todo;
    }
    markAsTodo(todo) {
        todo.status = "incomplete";
        this.state.completeTodos = this.state.completeTodos.filter((completeTodo) => completeTodo.id !== todo.id);
        this.state.incompleteTodos = [...this.state.incompleteTodos, todo];
        return todo;
    }
}
export { BasicState };
