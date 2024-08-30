module todo::todo {
    use std::option::is_none;
    use std::string::{String, length};
    use sui::event::emit;
    use sui::object;
    use sui::object::{UID};
    use sui::transfer;

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

    // Event struct for tracking actions on ToDo items
    public struct ToDoEvent has copy, drop {
        item: String,
        date: u64,
        action: String,
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

        let todo = ToDo {
            id,
            item,
            date,
            width,
            background,
            undo: true,
        };

        // Emit a more informative event
        emit(ToDoEvent {
            item,
            date: todo.date,
            action: b"add".to_string(),
        });

        transfer::public_transfer(todo, ctx.sender());
    }

    // Remove a ToDo item
    public entry fun remove(todo: ToDo) {
        let ToDo { id, item:_, date:_, width:_, undo:_, background:_ } = todo;
        object::delete(id);
        // It seems impossible to directly delete the ID because other properties of this object need to be released
        // object::delete(todo.id);
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
            item,
            date,
            action: b"update".to_string(),
        });
    }

    // Inquiries seems to be an old version keyword
    // Security and access control function (example)
    // fun is_authorized(sender: address, todo: &ToDo) acquires ToDo {
    //     // Add logic to check if the sender is authorized to modify this ToDo
    //     // E.g., compare sender with the creator's address stored in the ToDo
    // }
}
