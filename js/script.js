const $ = document;
const tasksField = $.getElementById("tasks");
const tasksFieldBody = tasksField.querySelector(".container-body");
const notStartedField = $.getElementById("not-started");
const inProgressField = $.getElementById("in-progress");
const completedField = $.getElementById("completed");
const taskCard = $.getElementById("task-card");
const addTaskBtn = $.querySelector(".add-task");
const modalWrapper = $.querySelector(".modal-wrapper");
const modal = $.getElementById("modal");
const newTaskInput = $.getElementById("new-task-input");
const modalAddBtn = $.getElementById("add-btn");
const modalCloseBtn = $.getElementById("modal-close");
let localStorageTasks;
let counter = 1;
let newAlpha = 0.8;
let defaultAlpha = 0.6;

if (!localStorage.getItem("taskList")) {
    localStorage.setItem("taskList", JSON.stringify([]));
}
localStorageTasks = JSON.parse(localStorage.getItem("taskList"));

function showModal() {
    modalWrapper.style.display = "block";
    modalWrapper.style.opacity = 1;
    newTaskInput.focus();
}

function showModalMsg(messageContent) {
    const inputMsg = $.querySelector(".input-msg");
    inputMsg.innerText = messageContent;
    inputMsg.style.visibility = "visible";
    inputMsg.style.opacity = 1;
    setTimeout(() => {
        inputMsg.style.visibility = "hidden";
        inputMsg.style.opacity = 0;
    }, 1000)
}

function closeTask(event) {
    let taskIndex, taskContentDiv;
    event.target.parentElement.style.display = "none";
    localStorageTasks = JSON.parse(localStorage.getItem("taskList"));
    localStorageTasks.forEach(task => {
        taskContentDiv = event.target.parentElement.querySelector(".task-content");
        console.log(taskContentDiv.innerText);
        if (task.content === taskContentDiv.innerText) {
            taskIndex = localStorageTasks.indexOf(task);
            localStorageTasks.splice(taskIndex, 1);
            localStorage.setItem("taskList", JSON.stringify(localStorageTasks));
            return;
        }
    });
}

function closeModal() {
    modalWrapper.style.opacity = 0;
    setTimeout(() => {
        modalWrapper.style.display = "none";
        newTaskInput.value = "";
    }, 350);
}

function createNewTaskByInput(contentInput) {
    let newCreatedTask = $.createElement("div");
    newCreatedTask.className = "task-card";
    newCreatedTask.id = "task-card" + counter++;
    newCreatedTask.draggable = true;

    let taskContent = $.createElement("div");
    taskContent.className = "task-content";
    taskContent.innerText = contentInput;

    let closeBtn = $.createElement("span");
    closeBtn.className = "close";
    closeBtn.innerText = '×';
    closeBtn.addEventListener('click', closeTask);

    newCreatedTask.append(taskContent);
    newCreatedTask.append(closeBtn);
    newCreatedTask.addEventListener('dragstart', startDragTask);
    return newCreatedTask;
}

function createNewTaskInModal() {
    if (newTaskInput.value.trim()) {
        let createdTask = createNewTaskByInput(newTaskInput.value.trim());
        tasksFieldBody.append(createdTask);
        localStorageTasks.push(
            {
                content: newTaskInput.value,
                category: "no-category"
            }
        );
        localStorage.setItem("taskList", JSON.stringify(localStorageTasks));
        closeModal();
    } else {
        showModalMsg("Task cannot be empty");
    }
}

function changeContainerBgColorAlpha(event, number) {
    if (event.target.className === "container-body") {
        let initialBgColor = window.getComputedStyle(event.target).getPropertyValue('background-color');
        let newBgColor = initialBgColor.replace(/[^,]+(?=\))/, String(number));
        event.target.style.backgroundColor = newBgColor;
    }
}

function startDragTask(event) {
    event.dataTransfer.setData("draggedTaskCard", event.target.id);
}

function allowDrop(event) {
    if (event.target.className === 'container-body') {
        event.preventDefault();
    }
}

function dropTask(event) {
    let taskCardId = event.dataTransfer.getData("draggedTaskCard");
    let draggedTaskCard = $.getElementById(taskCardId);
    event.target.append(draggedTaskCard);
    changeContainerBgColorAlpha(event, defaultAlpha);

    let droppedTaskContent = draggedTaskCard.querySelector(".task-content").innerText;
    localStorageTasks.forEach(task => {
        if (task.content === droppedTaskContent) {
            task.category = event.target.parentElement.id;
            return;
        }
    })
    localStorage.setItem('taskList', JSON.stringify(localStorageTasks));
}

addTaskBtn.addEventListener('click', showModal);
modalAddBtn.addEventListener('click', createNewTaskInModal);
modalCloseBtn.addEventListener('click', closeModal);
newTaskInput.addEventListener('keyup', event => {
    if (event.key === 'Enter') {
        createNewTaskInModal();
    } else if (event.key === 'Escape') {
        closeModal();
    }
});

notStartedField.addEventListener('dragenter', event => changeContainerBgColorAlpha(event, newAlpha));
notStartedField.addEventListener('dragover', allowDrop);
notStartedField.addEventListener('dragleave', event => changeContainerBgColorAlpha(event, defaultAlpha));
notStartedField.addEventListener('drop', dropTask);

inProgressField.addEventListener('dragenter', event => changeContainerBgColorAlpha(event, newAlpha));
inProgressField.addEventListener('dragover', allowDrop);
inProgressField.addEventListener('dragleave', event => changeContainerBgColorAlpha(event, defaultAlpha));
inProgressField.addEventListener('drop', dropTask);

completedField.addEventListener('dragenter', event => changeContainerBgColorAlpha(event, newAlpha));
completedField.addEventListener('dragover', allowDrop);
completedField.addEventListener('dragleave', event => changeContainerBgColorAlpha(event, defaultAlpha));
completedField.addEventListener('drop', dropTask);

window.onload = () => {
    if (localStorage.getItem("taskList")) {
        localStorageTasks = JSON.parse(localStorage.getItem("taskList"));
        let createdTask, currentBodyField;
        localStorageTasks.forEach(task => {
            createdTask = createNewTaskByInput(task.content);
            if (task.category === "no-category") {
                currentBodyField = $.getElementById("tasks").querySelector(".container-body");
                currentBodyField.append(createdTask);
            } else {
                currentBodyField = $.getElementById(task.category).querySelector(".container-body");
                currentBodyField.append(createdTask);
            }
        })
    }
}