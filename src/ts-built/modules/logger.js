// LOGGER
class ConsoleLogger {
    static log(todo, operation) {
        console.log(`The todo with id "${todo.id}" and description "${todo.description}" was just ${operation}`);
    }
}
export { ConsoleLogger };
