import { setCursorToEnd, generateUUID, adjustSelectWidth } from "./helper.js";

const addToDoButton = document.querySelector(".todo-list__add-button");
const todosDiv = document.querySelector(".todo-list");
const groupSelect = document.querySelector("[name='todoGroups']");

let todosInfoArr = [];

function createToDo(value, id) {
    const todo = document.createElement("li");
    const checkbox = document.createElement("input");
    const span = document.createElement("span");
    const closeBtn = document.createElement("button");

    todo.className = "todo-list__todo";
    checkbox.className = "todo-list__checkbox"
    checkbox.type = "checkbox";
    span.className = "todo-list__text";
    span.textContent = value;
    closeBtn.className = "todo-list__delete-button";

    todo.appendChild(checkbox);
    todo.appendChild(span);
    todo.appendChild(closeBtn);

    // initialization
    span.contentEditable = false;

    todo.addEventListener('dblclick', enableEditMode);
    span.addEventListener('blur', () => {
        const index = findToDoInfo(id);
        applyChanges(span, todosInfoArr[index]);
    });

    span.addEventListener("keydown", (event) => {
        if (event.currentTarget.textContent === "" && event.key === "Backspace") {
            deleteToDo(event.currentTarget.parentElement.id);
        } else if (event.key === "Enter") {
            const index = findToDoInfo(id);
            applyChanges(event.currentTarget, todosInfoArr[index]);
        }
    })

    checkbox.addEventListener("change", updateDoneTasks);
    checkbox.addEventListener("change", updateToDosGroup);
    closeBtn.addEventListener("click", deleteToDo.bind(null, id));

    todo.id = id;

    return todo;
}

function enableEditMode(event) {
    const span = event.currentTarget.querySelector("span");
    span.contentEditable = true;
    span.focus();
    setCursorToEnd(span);
}

function applyChanges(span, todoInfo) {
    span.contentEditable = false;
    if (span.textContent) {
        todoInfo.textContent = span.textContent;
    }
    saveToDosToStorage();
}

function appendToDo(todo) {
    todosDiv.appendChild(todo);
}

function updateDoneTasks() {
    const todos = document.querySelectorAll(".todo-list__todo");
    for (let i = 0; i < todos.length; i++) {
        const todo = todos[i];
        const checkbox = todo.querySelector("input[type=checkbox]");
        const index = todosInfoArr.findIndex(todoInfo => todoInfo.id === todo.id);
        if (index >= 0) {
            todosInfoArr[index].done = checkbox.checked;
        }
    }
    saveToDosToStorage();
}

function deleteToDo(id) {
    const index = todosInfoArr.findIndex(todoInfo => todoInfo.id === id);
    if (index >= 0) {
        todosInfoArr.splice(index, 1);
    }
    const todo = document.getElementById(id);
    todosDiv.removeChild(todo);
    updateEmptyList();
    saveToDosToStorage();
}

function findToDoInfo(id) {
    return todosInfoArr.findIndex(todoInfo => todoInfo.id === id);
}

function addToDo(event) {
    const input = event.currentTarget;
    const container = document.querySelector(".todo-list__wrapper");
    const todo = createToDo(input.value, "todo#" + generateUUID());

    const todoInfo = {
        textContent: todo.getElementsByTagName("span")[0].textContent,
        done: todo.getElementsByTagName("input")[0].checked,
        id: todo.id,
        creationDate: new Date().toISOString()
    }

    const filter = groupSelect.options[groupSelect.selectedIndex].value;
    updateToDo(filter, todo, todoInfo);

    todosInfoArr.push(todoInfo);

    appendToDo(todo);

    container.scrollTop = container.scrollHeight;
    input.value = '';
    updateEmptyList();
    saveToDosToStorage();
}

function setToDos(arr) {
    for (let todoInfo of arr) {
        const todo = createToDo(todoInfo.textContent, todoInfo.id);
        todo.getElementsByTagName("input")[0].checked = todoInfo.done;
        appendToDo(todo);
    }
}

function saveToDosToStorage() {
    chrome.storage.sync.set({ "todos": todosInfoArr });
}

function saveSelectToStorage() {
    chrome.storage.sync.set({ "group": groupSelect.value });
}

function setToDosFromStorage() {
    chrome.storage.sync.get(["group"], function (result) {
        if (result.group) {
            groupSelect.value = result.group;
        }
        adjustSelectWidth.apply(groupSelect);
    })
    chrome.storage.sync.get(["todos"], function (result) {
        if (result.todos) {
            todosInfoArr = result.todos;
            const filter = groupSelect.value;
            setToDos(filterTodos(filter));
            updateEmptyList();
        }
    });
}

function updateEmptyList() {
    const taskTranslation = `"Nothing to do"`;
    todosDiv.style.setProperty('--content-text', taskTranslation);
    if (todosDiv.children.length === 0) {
        todosDiv.classList.add("empty");
    } else {
        todosDiv.classList.remove("empty");
    }
}

function filterTodos(filter) {
    if (filter === "done") {
        return todosInfoArr.filter(todoInfo => todoInfo.done);
    } else if (filter === "undone") {
        return todosInfoArr.filter(todoInfo => !todoInfo.done);
    } else if (filter === "today") {
        return todosInfoArr.filter(todoInfo => {
            const creationDate = new Date(todoInfo.creationDate);
            const today = new Date();
            return creationDate.getDate() === today.getDate() && creationDate.getMonth() === today.getMonth() && creationDate.getFullYear() === today.getFullYear();
        })
    }
    return todosInfoArr;
}

function removeChilds(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function updateToDosGroup() {
    const filter = groupSelect.value;
    removeChilds(todosDiv);
    setToDos(filterTodos(filter));
    updateEmptyList();
}

function updateToDo(filter, todo, todoInfo) {
    const checkbox = todo.querySelector("input[type=checkbox]");
    if (filter === "done") {
        checkbox.checked = true;
        todoInfo.done = checkbox.checked;
    }
}

export function startToDosLogic() {
    setToDosFromStorage();

    groupSelect.addEventListener("change", adjustSelectWidth);

    groupSelect.addEventListener("change", updateToDosGroup);
    groupSelect.addEventListener("change", saveSelectToStorage);

    addToDoButton.addEventListener('keydown', (event) => {
        if (event.key === "Enter") addToDo(event);
    });
}