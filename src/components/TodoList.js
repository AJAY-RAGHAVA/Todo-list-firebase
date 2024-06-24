import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
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
      todosArray.sort((a, b) => a.order - b.order);
      setTodos(todosArray);
    });
  }, []);

  const addTodo = () => {
    if (newTodo.trim() === '') return;
    const todoRef = ref(database, 'todos');
    const newOrder = todos.length ? todos[todos.length - 1].order + 1 : 0;
    const todo = {
      text: newTodo,
      completed: false,
      order: newOrder
    };
    push(todoRef, todo);
    setNewTodo('');
  };

  const deleteTodo = (id) => {
    const todoRef = ref(database, `todos/${id}`);
    remove(todoRef);
  };

  const toggleComplete = (id) => {
    const todoRef = ref(database, `todos/${id}`);
    const updatedTodo = todos.find(todo => todo.id === id);
    update(todoRef, { completed: !updatedTodo.completed });
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
      <div>
        <input
          className="todo-input"
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={handleKeyPress}
        />&nbsp;
        <button className="add-button" onClick={addTodo}>Add</button><br/><br/><br/>
      </div>
      <DragDropContext onDragEnd={() => {}}>
        <Droppable droppableId="todos">
          {(provided) => (
            <ul className="todo-list" {...provided.droppableProps} ref={provided.innerRef}>
              {todos.map((todo, index) => (
                <Draggable key={todo.id} draggableId={todo.id} index={index}>
                  {(provided) => (
                    <li
                      className="todo-item"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <input
                        type="checkbox" 
                        className='checkbox'
                        checked={todo.completed}
                        onChange={() => toggleComplete(todo.id)}
                      />
                      <span className={`todo-text ${todo.completed ? 'completed' : ''}`}>
                        {todo.text}
                      </span>
                      <div className="button-group">
                        <button className="move-button" onClick={() => moveItem(todo.id, -1)}>⬆</button>
                        <button className="move-button" onClick={() => moveItem(todo.id, 1)}>⬇</button>
                        <button className="delete-button" onClick={() => deleteTodo(todo.id)}>✖</button>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default TodoList;
