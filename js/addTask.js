let tasks = []
let assignedContacts = []
let prios = []
let categories = []
let colorsCategory
let prioImages = ['./assets/img/urgent.png', './assets/img/medium.png', './assets/img/low.png']
let prioImagesFullCard = ['./assets/img/urgentOnclick.png', './assets/img/mediumOnclick.png', './assets/img/lowOnclick.png']
let tasksToEdit = []
let subtasksToSave = []
let percentOfDone
let colorOfBar
let checkboxState;
let checkedInput
let date = new Date();
let displayedCategories = [];
let existingCategoryToAddToTask
let existingColorCategoryToAddToTask

async function initAddTask() {
    initScript();
    try {
        setURL("https://ihor-tsarkov.developerakademie.net/Join/smallest_backend_ever-master");
        await downloadFromServer();
        tasks = await JSON.parse(await backend.getItem('tasks')) || []
        contacts = JSON.parse(backend.getItem('contacts')) || [];
        document.getElementById("date").setAttribute("min", date.toISOString().split("T")[0])
        displayExistingCategories()
        contactList()
    } catch (er) {
        console.error(er)
    }
}


/**controlls the addTaskButton */
function disableButtonAddTask() {
    let button = document.getElementById('addTaskButton')
    button.disabled = true;

    setTimeout(function () {
        button.disabled = false;
    }, 3000);
}


async function addToTasks() {
    let title = document.getElementById('task');
    let description = document.getElementById('description');
    let date = document.getElementById('date');
    let subtasks = subtasksToSave.splice(0, subtasksToSave.length)
    let category = document.getElementById('selectedCategoryInputValue');
    let assignedTo = assignedContacts.splice(0, assignedContacts.length)
    let prio = prios.slice(0).toString()

    let task = {
        title: title.value,
        description: description.value,
        assignedTo: assignedTo.value,
        date: date.value,
        prio,
        subtasks,
        readinessState: 'toDo',
        assignedTo,
        pace: 0
    };
    manageCategories(task, category, colorsCategory)
    await whenAllRequiredFilled(task)
}


/**checks if task.prio && task.category are filled, pushes the task, inables the button,saves it on server */
async function whenAllRequiredFilled(task) {
    if (task.prio && task.category) {
        tasks.push(task);
        disableButtonAddTask()
        await backend.setItem('tasks', JSON.stringify(tasks))
        popTheAddedDesk()
        setTimeout(function () { window.location.href = 'board.html'; }, 3000)
    } else if (!task.prio) {
        signalRequiredPriorities()
    } else if (!task.category || task.category == undefined) {
        signalRequiredCategory()
    }
}


/**checks if a new or existing  category and colorsCategory will be added*/
function manageCategories(task, category, colorsCategory) {
    if (category.value && colorsCategory.length > 0) {
        task.category = category.value
        task.colorCategory = colorsCategory.slice(0).toString()
    } else {
        task.category = existingCategoryToAddToTask
        task.colorCategory = existingColorCategoryToAddToTask
    }
}


/** draws red border if required priority not set*/
function signalRequiredPriorities() {
    document.getElementById('priorities').classList.add('fillRequired')
    setTimeout(() => {
        document.getElementById('priorities').classList.remove('fillRequired')
    }, 1000);
}


/** draws red border if required category not set*/
function signalRequiredCategory() {
    document.getElementById('categoryDropdown').classList.add('fillRequired')
    setTimeout(() => {
        document.getElementById('categoryDropdown').classList.remove('fillRequired')
    }, 1000);
}


function clearValuesOfAddTask(title, description, category, assignedTo, date) {
    title.value = '',
        description.value = '',
        category.value = '',
        assignedTo.value = '',
        date.value = '',
        assignedContacts = []
}


/**gets attribute from HTML element and according to that prepares priority to be added to task  */
function addPriority(i) {
    let selectedPriority = document.getElementById("prio" + i);
    let selectedUrgency = selectedPriority.getAttribute("value")
    if (prios.length == 0) {
        colorPrios(selectedUrgency, i)
        prios.push(selectedUrgency)
    } else {
        prios = []
        colorPrios(selectedUrgency, i)
        prios.push(selectedUrgency)
    }
}


/**checks selectedUrgency parameter and colors the corresponding image */
function colorPrios(selectedUrgency, i) {
    if (selectedUrgency == 'urgent') {
        document.getElementById("prio" + i).src = "./assets/img/urgentOnclick.png";
        document.getElementById("prio" + 2).src = "./assets/img/mediumImg.png";
        document.getElementById("prio" + 3).src = "./assets/img/lowImg.png";
    }
    if (selectedUrgency == 'medium') {
        document.getElementById("prio" + i).src = "./assets/img/mediumOnclick.png"
        document.getElementById("prio" + 1).src = "./assets/img/urgentImg.png"
        document.getElementById("prio" + 3).src = "./assets/img/lowImg.png"
    }
    if (selectedUrgency == 'low') {
        document.getElementById("prio" + i).src = "./assets/img/lowOnclick.png"
        document.getElementById("prio" + 1).src = "./assets/img/urgentImg.png"
        document.getElementById("prio" + 2).src = "./assets/img/mediumImg.png"
    }

}


/**pushes value of subtask to subtasksToSave*/
function addSubtask() {
    let subtask = document.getElementById('subtask');
    if (subtask.value) {
        subtasksToSave.push({
            subtask: subtask.value,
            checkedValue: 0,
        })
    }
    subtask.value = ''
    renderSubtasksOnAddTask()
}


/**removes subtasks */
function deleteSubtask(i) {
    subtasksToSave.splice(i, 1)
    renderSubtasksOnAddTask()
}


async function deleteTask(i) {
    tasks.splice(i, 1);
    await backend.setItem('tasks', JSON.stringify(tasks))
    renderTaskCards();
    document.getElementById('dialogFullCard').classList.add('displayNone')
}


function openInputAddCategory() {
    document.getElementById('selectedCategoryInputValue').value = ''
    document.getElementById('hiddenInputCategory').classList.remove('displayNone')
    document.getElementById('dropdownCategory').style = 'display:none'
}


function addCategoryOnTask() {
    let value = document.getElementById('selectedCategoryInputValue').value;
    if (value) {
        document.getElementById('labelCategory').innerHTML = '';
        document.getElementById('labelCategory').innerHTML = `<div class="assignedCategoryValues">
         ${value}
          <div class="colorPicker colorPickerAssigned" style="background-color: ${colorsCategory}"  id="assignedColor"></div>
         </div>` ;
        document.getElementById('hiddenInputCategory').classList.add('displayNone')
        document.getElementById('dropdownCategory').style = 'none'
    }
}


/**adds color to category*/
function addCategoryColorOnTask(i) {
    let value = document.getElementById('selectedCategoryInputValue').value;
    if (value) {
        let color = document.getElementById("color" + i).style.backgroundColor
        colorsCategory = color
        addCategoryOnTask()
    }
}


function openInputAddContact() {
    document.getElementById('hiddenInputAddContact').classList.remove('displayNone')
    document.getElementById('dropdownAddContact').style = 'display:none'

}


/**pushes to assigned contacts if not added befor,otherwise splices contact onclick*/
function addToAssignedContacts(index) {
    if (index < contacts.length) {
        let contact = contacts[index];
        contact.id = 1
        if (!assignedContacts.includes(contact)) {
            assignedContacts.push(contact);
        } else {
            assignedContacts.splice(assignedContacts.indexOf(contact), 1);
        }
    }
}


async function popTheAddedDesk() {
    document.getElementById('popUpWhenAdded').classList.remove('displayNone')
    setTimeout(function () { document.getElementById('popUpWhenAdded').classList.add('displayNone') }, 2000)
}


function closeHiddenInput() {
    document.getElementById('hiddenInputCategory').classList.add('displayNone')
    document.getElementById('dropdownCategory').style = 'display:inlineBlock'
}


/**renders subtasks from subtasksToSave */
function renderSubtasksOnAddTask() {
    document.getElementById('subtasksOnAddTask').innerHTML = ''
    subtasksToSave.forEach((subtask, index) => {
        document.getElementById('subtasksOnAddTask').innerHTML += `<div class="checkBoxDiv">
        <label class="subtaskLabel">${subtask.subtask}</label><img src=".././assets/img/closeButtonBoard.png" onclick="deleteSubtask(${index})">
        </div>`
    })
}


/**iterates through contacts */
function contactList() {
    let dropdownAddContact = document.getElementById('dropdownAddContact');
    dropdownAddContact.innerHTML = ''
    contacts.forEach((contact, index) => {
        dropdownAddContact.innerHTML += `<div class="droppedContacts"><a>${contact.name}</a><input id="checkboxAssigned${index}" onclick="addToAssignedContacts('${index}')" type="checkbox"></div>`;
    })
}


/**displays all existing categories */
function displayExistingCategories() {
    const dropdownCategory = document.getElementById('dropdownCategory');
    dropdownCategory.innerHTML = '';
    dropdownCategory.innerHTML = '<a onclick="openInputAddCategory()" href="#">Add category</a>';

    for (let i = 0; i < tasks.length; i++) {
        let task = tasks[i];
        if (!displayedCategories.includes(task.category)) {
            dropdownCategory.innerHTML +=
                HTMLforExistingCategories(task)
            displayedCategories.push(task.category)
        }
    }
}


/**displays clicked category and its color as label and sets them to be added to task*/
function displayAddedCategoryFromSaved(category, colorCategory) {
    document.getElementById('labelCategory').innerHTML = `<div class="assignedCategoryValues">
    <a>${category}</a>
    <div class="colorPicker colorPickerAssigned" style="background-color: ${colorCategory}; margin-bottom: 0 "></div>
</div>`;
    existingCategoryToAddToTask = category
    existingColorCategoryToAddToTask = colorCategory
}






