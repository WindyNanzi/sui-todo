module todo::todo {
    use std::option::{is_none, none};
    use std::string::{String, length, concat, b};
    use sui::event::emit;
    use sui::object::{Self, UID, new, delete};
    use sui::transfer::{Self, public_transfer};
    use sui::tx_context::TxContext;

    // Error codes for specific errors
    const E_ITEM_TOO_LONG: u64 = 1001;  // Error when item length exceeds limit
    const E_UNAUTHORIZED: u64 = 1002;   // Error for unauthorized access
    const E_ITEM_NOT_FOUND: u64 = 1003; // Error when ToDo item is not found

    // Struct representing a ToDo item
    public struct ToDo has key, store {
        id: UID,
        item: String,
        date: u64,
        width: u8,
        undo: bool,
        background: String,
        creator: address,
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

        let id = new(ctx);
        let todo = ToDo {
            id,
            item: item.clone(),
            date,
            width,
            background,
            undo: true,
            creator: ctx.sender(),
        };

        // Emit an event for adding a new ToDo item
        emit(ToDoEvent {
            item: item.clone(),
            date,
            action: b"add".to_string(),
        });

        // Transfer the newly created ToDo object to the sender
        public_transfer(todo, ctx.sender());
    }

    // Remove a ToDo item
    public entry fun remove(todo: &ToDo, ctx: &mut TxContext) acquires ToDo {
        // Check if the sender is authorized to delete the ToDo item
        assert!(ctx.sender() == todo.creator, E_UNAUTHORIZED);

        let ToDo { id, .. } = todo;
        delete(id);

        // Emit an event for removing a ToDo item
        emit(ToDoEvent {
            item: todo.item.clone(),
            date: todo.date,
            action: b"remove".to_string(),
        });
    }

    // Update a ToDo item
    public entry fun update(
        item: String,
        date: u64,
        width: u8,
        background: String,
        undo: bool,
        todo: &mut ToDo,
        ctx: &mut TxContext
    ) acquires ToDo {
        // Check item length and handle potential errors
        assert!(length(&item) <= 1000, E_ITEM_TOO_LONG);

        // Check if the sender is authorized to update the ToDo item
        assert!(ctx.sender() == todo.creator, E_UNAUTHORIZED);

        todo.item = item.clone();
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

    // Toggle undo state of a ToDo item
    public entry fun toggle_undo(todo: &mut ToDo, ctx: &mut TxContext) acquires ToDo {
        // Check if the sender is authorized to update the ToDo item
        assert!(ctx.sender() == todo.creator, E_UNAUTHORIZED);

        todo.undo = !todo.undo;

        // Emit an event for the toggle operation
        emit(ToDoEvent {
            item: todo.item.clone(),
            date: todo.date,
            action: concat(b"toggle_undo: ", if (todo.undo) { b"true".to_string() } else { b"false".to_string() }),
        });
    }

    // Retrieve all ToDo items (Placeholder for potential feature)
    // This function demonstrates the ability to potentially retrieve all items
    // If needed, implement a storage pattern to support querying
    public fun get_all_todos(): vector<ToDo> {
        // Implement storage and retrieval mechanism if needed
        // This is a placeholder function for demonstration purposes
        vector::empty<ToDo>()
    }
}
