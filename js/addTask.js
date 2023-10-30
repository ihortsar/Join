let tasks = []
let assignedContacts = []
let prios = []
let categories = []
let colorsCategory = []
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
let readinessState = 'toDo'
let assignedFlag = false
let assignedTo



async function initAddTask() {
    initScript();
    try {
        tasks = JSON.parse(await getItem('tasks')) || []
        contacts = JSON.parse(await getItem('contacts')) || [];
        document.getElementById("date").setAttribute("min", date.toISOString().split("T")[0])
        displayExistingCategories()
        /*     console.log(tasks); */
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
    let prio = prios.slice(0).toString()

    let task = {
        title: title.value,
        description: description.value,
        date: date.value,
        prio,
        subtasks,
        readinessState: readinessState,
        pace: 0
    };
    manageCategories(task, category, colorsCategory)
    await whenAllRequiredFilled(task)
}




/**checks if task.prio && task.category are filled, pushes the task, inables the button,saves it on server */
async function whenAllRequiredFilled(task) {
    if (task.prio && task.category && assignedFlag) {
        task.assignedTo = assignedContacts.splice(0, assignedContacts.length)
        tasks.push(task);
        disableButtonAddTask()
        await setItem('tasks', JSON.stringify(tasks))
        popTheAddedDesk()
        setTimeout(function () { window.location.href = 'board.html'; }, 3000)
    } else { conditionsIfRequiredSkipped(task) }
}


function conditionsIfRequiredSkipped(task) {
    if (!task.prio) {
        signalRequiredPriorities()
    } else if (!task.category || task.category == undefined) {
        signalRequiredCategory()
    } else if (contacts.length > 0 && !assignedFlag) {
        signalRequiredContact()
    }
}


function addAssignedToTask(task) {
    task.assignedTo = assignedContacts.splice(0, assignedContacts.length)
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


/** draws red border if required contact not set*/
function signalRequiredContact() {
    document.getElementById('dropdownAssigned').classList.add('fillRequired')
    setTimeout(() => {
        document.getElementById('dropdownAssigned').classList.remove('fillRequired')
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
    selectedUrgencyCheckUrgent(selectedUrgency, i)
    selectedUrgencyCheckMedium(selectedUrgency, i)
    selectedUrgencyCheckLow(selectedUrgency, i)
}


function selectedUrgencyCheckUrgent(selectedUrgency, i) {
    if (selectedUrgency == 'urgent') {
        document.getElementById("prio" + i).src = "./assets/img/urgentOnclick.png";
        document.getElementById("prio" + 2).src = "./assets/img/mediumImg.png";
        document.getElementById("prio" + 3).src = "./assets/img/lowImg.png";
    }
}


function selectedUrgencyCheckMedium(selectedUrgency, i) {
    if (selectedUrgency == 'medium') {
        document.getElementById("prio" + i).src = "./assets/img/mediumOnclick.png"
        document.getElementById("prio" + 1).src = "./assets/img/urgentImg.png"
        document.getElementById("prio" + 3).src = "./assets/img/lowImg.png"
    }
}


function selectedUrgencyCheckLow(selectedUrgency, i) {
    if (selectedUrgency == 'low') {
        document.getElementById("prio" + i).src = "./assets/img/lowOnclick.png"
        document.getElementById("prio" + 1).src = "./assets/img/urgentImg.png"
        document.getElementById("prio" + 2).src = "./assets/img/mediumImg.png"
    }
}


/**pushes value of subtask to subtasksToSave*/
function addSubtask(i) {
    let subtask = document.getElementById(i);
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
    await setItem('tasks', JSON.stringify(tasks))
    renderTaskCards();
    document.getElementById('dialogFullCard').classList.add('displayNone')
}


function openInputAddCategory() {
    document.getElementById('selectedCategoryInputValue').value = ''
    document.getElementById('hiddenInputCategory').classList.remove('displayNone')
    document.getElementById('dropdownCategory').style = 'display:none'
}


/**adds category to task*/
function addCategoryOnTask() {
    let value = document.getElementById('selectedCategoryInputValue').value;
    if (value) {
        document.getElementById('labelCategory').innerHTML = '';
        document.getElementById('labelCategory').innerHTML = `<div class="assignedCategoryValues">
         ${value}
          <div class="colorPicker colorPickerAssigned" style="background-color: ${colorsCategory}"  id="assignedColor"></div>
         </div>` ;
        document.getElementById('hiddenInputCategory').classList.add('displayNone')
        document.getElementById('dropdownCategory').style.display = 'none'
    }
}


/**adds color to category*/
function addCategoryColorOnTask(i) {
    let value = document.getElementById('selectedCategoryInputValue').value;
    if (value) {
        let color = document.getElementById("color" + i).style.backgroundColor
        if (colorsCategory.length == 0) {
            colorsCategory.push(color)
        } else {
            colorsCategory = []
            colorsCategory.push(color)
        }
        addCategoryOnTask()
    }
}


function openInputAddContact() {
    document.getElementById('hiddenInputAddContact').classList.remove('displayNone')
    document.getElementById('dropdownAddContact').style = 'display:none'

}


/**checks if the name of contact in contacts was changed*/
async function checkIfTheContactNameChanged(i, contact) {
    let filteredContacts = contacts.filter(maincontact => {
        return maincontact.email === tasks[i].assignedTo[contact].email;
    });

    if (filteredContacts.length > 0) {
        tasks[i].assignedTo[contact].firstNameLetter = filteredContacts[0].firstNameLetter;
        tasks[i].assignedTo[contact].lastNameLetter = filteredContacts[0].lastNameLetter;
    } else {
        tasks[i].assignedTo.splice(1, contact)
        await setItem('tasks', JSON.stringify(tasks))
    }
}


