import { ConsoleLogger } from "./logger.js";
class ImmutableState {
    state = {
        completeTodos: [],
        incompleteTodos: [],
    };
    reducer = function (state, { type, payload }) {
        ConsoleLogger.log(payload.todo, type);
        switch (type) {
            case "add": {
                const incompleteTodos = [...state.incompleteTodos, payload.todo];
                return { ...state, incompleteTodos };
            }
            case "remove": {
                const completeTodos = state.completeTodos.filter((completeTodo) => completeTodo.id !== payload.todo.id);
                const incompleteTodos = state.incompleteTodos.filter((incompleteTodo) => incompleteTodo.id !== payload.todo.id);
                return { ...state, completeTodos, incompleteTodos };
            }
            case "done": {
                const doneTodo = {
                    ...payload.todo,
                    status: "complete",
                };
                const incompleteTodos = state.incompleteTodos.filter((incompleteTodo) => incompleteTodo.id !== doneTodo.id);
                const completeTodos = [...state.completeTodos, doneTodo];
                return {
                    ...state,
                    incompleteTodos,
                    completeTodos,
                };
            }
            case "undo": {
                const undoneTodo = {
                    ...payload.todo,
                    status: "incomplete",
                };
                const completeTodos = state.completeTodos.filter((completeTodo) => completeTodo.id !== undoneTodo.id);
                const incompleteTodos = [...this.state.incompleteTodos, undoneTodo];
                return { ...state, completeTodos, incompleteTodos };
            }
            default: {
                return state;
            }
        }
    };
    findTodo(queryProp, queryValue) {
        const foundTodo = [
            ...this.state.completeTodos,
            ...this.state.incompleteTodos,
        ].find((todo) => todo[queryProp] === queryValue);
        return foundTodo;
    }
    addTodo(todo) {
        this.state = this.reducer(this.state, {
            type: "add",
            payload: { todo },
        });
    }
    removeTodo(todo) {
        this.state = this.reducer(this.state, {
            type: "remove",
            payload: { todo },
        });
    }
    markAsDone(todo) {
        this.state = this.reducer(this.state, {
            type: "done",
            payload: { todo },
        });
    }
    markAsTodo(todo) {
        this.state = this.reducer(this.state, {
            type: "undo",
            payload: { todo },
        });
    }
}
export { ImmutableState };
