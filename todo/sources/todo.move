#[allow(duplicate_alias)]
module todo::todo {
  use std::string::{String, length};
  use sui::event::emit;
  use sui::object;
  use sui::transfer;

  const ETooLongString :u64 = 0;

  public struct ToDo has key, store {
    id: UID,
    item: String,
    date: u64,
    width: u8,
    undo: bool,
    background: String,
  }

  public struct ToDoCap has key {
    id: UID
  }

  public struct Length has copy,drop {
    len: u64
  }

  fun init(ctx: &mut TxContext) {
    let todo_cap = ToDoCap {
      id: object::new(ctx)
    };

    transfer::share_object(todo_cap);
  }

  public entry fun add (
    item: String,
    date: u64,
    width: u8,
    background: String,
    ctx: &mut TxContext
  ) {
    assert!(length(&item) <= 1000, ETooLongString);

    let todo = ToDo {
      id: object::new(ctx),
      item,
      date,
      width,
      background,
      undo: true,
    };

    emit(Length {
      len: length(&item),
    });

    transfer::transfer(todo, ctx.sender());
  }

  public entry fun remove(todo: ToDo) {
    let ToDo { id, item:_, date:_, width:_, background:_, undo:_ } = todo;
    object::delete(id);
  }


  public entry fun update (
    item: String,
    date: u64,
    width: u8,
    background: String,
    undo: bool,
    todo: &mut ToDo,
  ) {
    assert!(length(&item) <= 1000, ETooLongString);

    todo.item = item;
    todo.date = date;
    todo.width = width;
    todo.undo = undo;
    todo.background = background;

    emit(Length {
      len: length(&item),
    });
  }

}