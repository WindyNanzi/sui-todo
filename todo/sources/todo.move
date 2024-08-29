module todo::todo {
    use std::string::{String, length};
    use sui::event::emit;
    use sui::object::{self, UID};
    use sui::transfer;
    use sui::error::abort;

    // Error codes for specific errors
    const E_ITEM_TOO_LONG: u64 = 1001;  // Error when item length exceeds limit
    const E_OBJECT_CREATION_FAILED: u64 = 1002;  // Error when object creation fails

    // Struct representing a ToDo item
    public struct ToDo has key, store {
        id: UID,
        item: String,
        date: u64,
        width: u8,
        undo: bool,
        background: String,
    }

    // Capability for managing ToDo objects (no fields necessary)
    public struct ToDoCap;

    // Event struct for tracking actions on ToDo items
    public struct ToDoEvent has copy, drop {
        item: String,
        date: u64,
        action: String,
    }

    // Initialize function to create a capability object
    fun init(ctx: &mut TxContext) {
        let todo_cap = ToDoCap {};
        // Share or publicize the capability as needed
        transfer::freeze_object(todo_cap);
    }

    // Add a new ToDo item
    public entry fun add(
        item: String,
        date: u64,
        width: u8,
        background: String,
        ctx: &mut TxContext
    ) {
        // Check item length and handle potential errors
        assert!(length(&item) <= 1000, E_ITEM_TOO_LONG);
        
        let id = object::new(ctx);
        if (id.is_none()) {
            abort(E_OBJECT_CREATION_FAILED);
        }
        let todo = ToDo {
            id: id.unwrap(),
            item,
            date,
            width,
            background,
            undo: true,
        };

        // Emit a more informative event
        emit(ToDoEvent {
            item: todo.item.clone(),
            date: todo.date,
            action: "add".to_string(),
        });

        transfer::publicize_object(todo);
    }

    // Remove a ToDo item
    public entry fun remove(todo: ToDo) {
        object::delete(todo.id);
    }

    // Update a ToDo item
    public entry fun update(
        item: String,
        date: u64,
        width: u8,
        background: String,
        undo: bool,
        todo: &mut ToDo,
    ) {
        // Check item length and handle potential errors
        assert!(length(&item) <= 1000, E_ITEM_TOO_LONG);

        todo.item = item;
        todo.date = date;
        todo.width = width;
        todo.undo = undo;
        todo.background = background;

        // Emit an event for the update operation
        emit(ToDoEvent {
            item: todo.item.clone(),
            date: todo.date,
            action: "update".to_string(),
        });
    }

    // Security and access control function (example)
    fun is_authorized(sender: address, todo: &ToDo) acquires ToDo {
        // Add logic to check if the sender is authorized to modify this ToDo
        // E.g., compare sender with the creator's address stored in the ToDo
    }
}
