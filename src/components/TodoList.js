import React, { useState, useEffect } from 'react';
import { FaTrashAlt, FaThumbtack } from 'react-icons/fa';
import { AiFillCaretUp, AiFillCaretDown } from 'react-icons/ai';
import database from '../firebase';
import { ref, onValue, push, remove, update } from 'firebase/database';
import './TodoList.css';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    const todoRef = ref(database, 'todos');
    onValue(todoRef, (snapshot) => {
      const todoList = snapshot.val();
      const todosArray = [];
      for (let id in todoList) {
        todosArray.push({ id, ...todoList[id] });
      }
      todosArray.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return a.order - b.order;
      });
      setTodos(todosArray);
    });
  }, []);

  const addTodo = () => {
    if (newTodo.trim() === '') return;
    const todoRef = ref(database, 'todos');
    const newOrder = todos.length ? todos[todos.length - 1].order + 1 : 0;
    const todo = {
      text: newTodo,
      pinned: false,
      order: newOrder
    };
    push(todoRef, todo);
    setNewTodo('');
  };

  const deleteTodo = (id) => {
    const todoRef = ref(database, `todos/${id}`);
    remove(todoRef);
  };

  const pinTodo = (id) => {
    const todoRef = ref(database, `todos/${id}`);
    const updatedTodo = todos.find(todo => todo.id === id);
    update(todoRef, { pinned: !updatedTodo.pinned });
  };

  const moveItem = (id, direction) => {
    const currentIndex = todos.findIndex(todo => todo.id === id);
    const newIndex = currentIndex + direction;

    if (newIndex < 0 || newIndex >= todos.length) return;

    const updatedTodos = Array.from(todos);
    const [movedItem] = updatedTodos.splice(currentIndex, 1);
    updatedTodos.splice(newIndex, 0, movedItem);

    setTodos(updatedTodos);

    updatedTodos.forEach((item, index) => {
      const todoRef = ref(database, `todos/${item.id}`);
      update(todoRef, { order: index });
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  return (
    <div className="todo-container">
      <h1 className='title'>Todo List</h1>
      
      <ul className="todo-list">
        {todos.map((todo, index) => (
          <li key={todo.id} className={`todo-item ${todo.pinned ? 'pinned' : ''}`}>
            <span className="todo-text">{todo.text}</span>
            <div className="button-group">
              <button
                className="move-button"
                onClick={() => moveItem(todo.id, -1)}
                disabled={index === 0 || todos[index].pinned || (index === 1 && todos[0].pinned)}
              >
                <AiFillCaretUp />
              </button>
              <button
                className="move-button"
                onClick={() => moveItem(todo.id, 1)}
                disabled={index === todos.length - 1 || todos[index].pinned}
              >
                <AiFillCaretDown />
              </button>
              <button className="delete-button" onClick={() => deleteTodo(todo.id)}>
                ✖
              </button>
              <button className="pin-button" onClick={() => pinTodo(todo.id)}>
                <FaThumbtack color={todo.pinned ? 'blue' : 'black'} />
              </button>
              
            </div>
          </li>
        ))}
      </ul>

      <div className='todo-add'>
        <div className='add-text'>
          <input
            className="todo-input"
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="add-button" onClick={addTodo}>Add</button>
        </div>
      </div>
    </div>
  );
};

export default TodoList;
