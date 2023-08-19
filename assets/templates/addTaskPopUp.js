
function renderSubtasksOnPopUpAddTask() {
    document.getElementById('subtasksPopUp').innerHTML = ''
    subtasksToSave.forEach((subtask, index) => {
        document.getElementById('subtasksPopUp').innerHTML += `<div class="checkBoxDiv">
        <label class="subtaskLabel">${subtask.subtask}</label><img src="./assets/img/closeButtonBoard.png" onclick="deleteSubtask(${index})">
        </div>`
    })
}


function openPopUpAddTask(state) {
    contactList('dropdownAddContactPopUp')
    readinessState = state
    document.getElementById('addTaskPopUp').classList.add('openPopUp')
    document.getElementById(`date`).setAttribute("min", date.toISOString().split("T")[0]);
}


function closePopUpAddTask() {
    document.getElementById('addTaskPopUp').classList.remove('openPopUp')
}


async function addEditedPriority(i, j) {
    let selectedPriority = document.getElementById("prio" + j);
    let selectedUrgency = selectedPriority.getAttribute("value")
    tasks[i].prio = selectedUrgency
    editColorPrios(selectedUrgency, j)
    await backend.setItem('tasks', JSON.stringify(tasks))
}


function editColorPrios(selectedUrgency, i) {
    if (selectedUrgency == 'urgent') {
        document.getElementById("prio" + i).src = "./assets/img/urgentOnclick.png";
        document.getElementById("prio" + 5).src = "./assets/img/mediumImg.png";
        document.getElementById("prio" + 6).src = "./assets/img/lowImg.png";
    }
    if (selectedUrgency == 'medium') {
        document.getElementById("prio" + i).src = "./assets/img/mediumOnclick.png"
        document.getElementById("prio" + 4).src = "./assets/img/urgentImg.png"
        document.getElementById("prio" + 6).src = "./assets/img/lowImg.png"
    }
    if (selectedUrgency == 'low') {
        document.getElementById("prio" + i).src = "./assets/img/lowOnclick.png"
        document.getElementById("prio" + 4).src = "./assets/img/urgentImg.png"
        document.getElementById("prio" + 5).src = "./assets/img/mediumImg.png"
    }
}



function checkForCheckedAssigned() {
    let checkedbox
    contacts.forEach((contact, index) => {
        assignedContacts.forEach(assigned => {
            checkedbox = document.getElementById(`checkboxAssigned${index}`)
            if (contact.email === assigned.email) {
                checkedbox.checked = true;
            }
        });
    });
}



/**html of all existing categories */
function HTMLforExistingCategories(task) {
    return `<div onclick="displayAddedCategoryFromSaved('${task.category}','${task.colorCategory}')" class="assignedCategoryValues">
    <a>${task.category}</a>
    <div class="colorPicker colorPickerAssigned" style="background-color: ${task.colorCategory}; margin-bottom: 0 "></div>
</div>`;
}


/**pushes to assigned contacts if not added before,otherwise splices contact onclick*/
function addToAssignedContacts(index) {
    if (index < contacts.length) {
        let contact = contacts[index];
        contact.id = 1
        if (!assignedContacts.includes(contact)) {
            assignedContacts.push(contact);
            assignedFlag = true
        } else {
            assignedContacts.splice(assignedContacts.indexOf(contact), 1);
            if (assignedContacts.length == 0) { assignedFlag = false }
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
        <label class="subtaskLabel">${subtask.subtask}</label><img src="./assets/img/closeButtonBoard.png" onclick="deleteSubtask(${index})">
        </div>`
    })
}


/**iterates through contacts */
function contactList(id) {
    let droppedContacts = document.getElementById(id);
    if (droppedContacts.style.display === 'none') {
        droppedContacts.style.display = 'block'
    } else { droppedContacts.style.display = 'none' }
    droppedContacts.innerHTML = ''

    contacts.forEach((contact, index) => {
        droppedContacts.innerHTML += `<div class="droppedContacts formDiv"><a>${contact.name}</a><input id="checkboxAssigned${index}" onclick="addToAssignedContacts('${index}')" type="checkbox"></div>`;
    })
    checkForCheckedAssigned()
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


/**clears subsections on board */
function clearSubsections() {
    document.getElementById('boardSubsectionToDo').innerHTML = ''
    document.getElementById('boardSubsectionInProgress').innerHTML = ''
    document.getElementById('boardSubsectionFeedback').innerHTML = ''
    document.getElementById('boardSubsectionDone').innerHTML = ''
}