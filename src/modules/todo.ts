import { UUIDInterface } from "./uuid.js";

// TODO

class Todo {
  description: string;
  status: "incomplete" | "complete";
  date: Date;
  id: ReturnType<UUIDInterface["createRandomUUID"]>;

  constructor(description, date, UUID) {
    this.description = description;
    this.status = "incomplete";
    this.date = date;
    this.id = UUID;
  }
}

export { Todo };
