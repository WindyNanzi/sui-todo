#[allow(duplicate_alias)]
module todo::todo {
  use std::ascii::String;
  use sui::object;
  use sui::transfer;

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
    let todo = ToDo {
      id: object::new(ctx),
      item,
      date,
      width,
      background,
      undo: true,
    };

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
    todo.item = item;
    todo.date = date;
    todo.width = width;
    todo.undo = undo;
    todo.background = background;
  }

}

// hash 479VxfVnKPYTcrZtj7tpTEqmNxd5fVyiXzJfK4S22Jg5
// packageid 0x9b4fa99ee6543ba41ab1cf4b12d5097eb752cdecfaeaba45afa3aa450b696736