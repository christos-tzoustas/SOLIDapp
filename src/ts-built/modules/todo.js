// TODO
class Todo {
    description;
    status;
    date;
    id;
    constructor(description, date, UUID) {
        this.description = description;
        this.status = "incomplete";
        this.date = date;
        this.id = UUID;
    }
}
export { Todo };
