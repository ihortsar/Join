tasks = []
assignedContacts = []
prios = []
categories = []
colorsCategory = []
prioImages = ['./assets/img/urgent.png', './assets/img/medium.png', './assets/img/low.png']
prioImagesFullCard = ['./assets/img/urgentOnclick.png', './assets/img/mediumOnclick.png', './assets/img/lowOnclick.png']
tasksToEdit = []
subtasksToSave = []
let currentDragged
let percentOfDone
let colorOfBar
let checkboxState;
let checkedInput
let statusOpen





async function initBoard() {
    await initScript();
    try {
        setURL("https://ihor-tsarkov.developerakademie.net/Join/smallest_backend_ever-master");
        await downloadFromServer();
        tasks = await JSON.parse(await backend.getItem('tasks')) || []
        contacts = JSON.parse(backend.getItem('contacts')) || [];
        renderTaskCards()
    } catch (er) {
        console.error(er)
    }
}

/**clears the page, filters tasks, iterates through tasks looking for entered value in filterTasks() */
function renderTaskCards(i, j) {
    clearSubsections()
    let search = filterTasks()
    j = 0;
    for (i = 0; i < tasks.length; i++) {
        if (tasks[i].title.toLowerCase().includes(search) || tasks[i].description.toLowerCase().includes(search)) {
            checkForReadiness(i, j)
            document.getElementById('progressBar' + i).style.background = tasks[i].colorOfBar
            renderAssignedContactsOnBoard(i)
            hideProgressSection(i)
            j++
        }
    }
}


/**hides progress section if there are no subtasks */
function hideProgressSection(i) {
    if (tasks[i].subtasks.length == 0) {
        document.getElementById(`progressBarSection${i}`).classList.remove('progressBarSection');
        document.getElementById(`progressBarSection${i}`).classList.add('displayNone');
    }
}


/**renders and sets colors to the reassigned contacts */
function renderAssignedContactsOnBoard(i, colorCircle, contact) {
    colorCircle = 0
    if (tasks[i].assignedTo) {
        document.getElementById(`assignedToCircles${i}`).innerHTML = ''
        for (contact = 0; contact < tasks[i].assignedTo.length; contact++) {
            checkIfTheContactNameChanged(i, contact)
            HTMLforRenderAssignedContactsOnBoard(i, colorCircle, contact)
            colorCircle++
            if (colorCircle == 6) { colorCircle = 0 }
        }
    }
}


/**crenders and sets colors to the reassigned contacts on full card */
function renderAssignedContactsOnFullCard(i, colorCircle, contact) {
    colorCircle = 0
    if (tasks[i].assignedTo) {
        document.getElementById(`assignedToFullCard`).innerHTML = ''
        for (contact = 0; contact < tasks[i].assignedTo.length; contact++) {
            checkIfTheContactNameChanged(i, contact)
            HTMLforRenderAssignedContactsOnFullCard(i, colorCircle, contact)
            colorCircle++
            if (colorCircle == 6) { colorCircle = 0 }
        }
    }
}


/**checks if the name of contact in contacts was changed*/
function checkIfTheContactNameChanged(i, contact) {
    contacts.filter(maincontact => {
        if (maincontact.email === tasks[i].assignedTo[contact].email) {
            tasks[i].assignedTo[contact].firstNameLetter = maincontact.firstNameLetter;
            tasks[i].assignedTo[contact].lastNameLetter = maincontact.lastNameLetter;
        }
    })
}


/**draws urgency pictures on board*/
function priorityImageForRenderTaskCards(i, j) {
    if (tasks[i].prio == 'urgent') { document.getElementById(`urgencyBoard${j}`).src = prioImages[0] }
    if (tasks[i].prio == 'medium') { document.getElementById(`urgencyBoard${j}`).src = prioImages[1] }
    if (tasks[i].prio == 'low') { document.getElementById(`urgencyBoard${j}`).src = prioImages[2] }

}


/**crenders and sets colors to the reassigned contacts on FullTaskCard */
function priorityImageForRenderFullTaskCard(i) {
    if (tasks[i].prio == 'urgent') { document.getElementById(`urgencyFullCard${i}`).src = prioImagesFullCard[0] }
    if (tasks[i].prio == 'medium') { document.getElementById(`urgencyFullCard${i}`).src = prioImagesFullCard[1] }
    if (tasks[i].prio == 'low') { document.getElementById(`urgencyFullCard${i}`).src = prioImagesFullCard[2] }

}


/**defines the dragged div */
async function renderDialogFullCard(i) {
    let counter = 0
    document.getElementById('dialogFullCard').classList.remove('displayNone')
    document.getElementById('dialogFullCard').innerHTML = HTMLrenderDialogFullCard(i)
    priorityImageForRenderFullTaskCard(i)
    renderSubtasksOnFullCard(i, counter)
    renderAssignedContactsOnFullCard(i)
    checkForChecked(i, `checkBox${counter}`)
    let changeStatus = document.getElementById(`dropdown-contentForMobileDevices${i}`);
    changeStatus.style.display = 'none'
}


/**renders subtasks on full card */
function renderSubtasksOnFullCard(i, counter) {
    return tasks[i].subtasks.forEach(subtask => {
        document.getElementById('subtasksFullCard').innerHTML += HTMLrenderSubtasksDialogFullCard(i, subtask, counter)
        counter++
    })
}


/**opens the edit task dialog,sets the time in calender, checks if it's opened and colors the selected urgency */
function openEditTask(i) {
    let changeStatus = document.getElementById(`dropdown-contentForMobileDevices${i}`);
    changeStatus.style.display = 'none'
    document.getElementById('dialogEditCard').classList.remove('displayNone')
    document.getElementById('dialogEditCard').innerHTML = openEditTaskHTML(i)
    document.getElementById(`editedDate`).setAttribute("min", date.toISOString().split("T")[0]);
    listenToEvent(i)
    colorPriosForEditTask(i)
}

/**gets the current state of tasks, redefines values for the task,saves them and renders */
async function editTask(i) {
    tasks = JSON.parse(await backend.getItem('tasks'))
    let title = document.getElementById('editedTask');
    let description = document.getElementById('editedDescription');
    let date = document.getElementById('editedDate');


    tasks[i] = {
        title: title.value,
        description: description.value,
        category: tasks[i].category,
        colorCategory: tasks[i].colorCategory,
        date: date.value,
        assignedTo: tasks[i].assignedTo,
        prio: tasks[i].prio,
        readinessState: tasks[i].readinessState,
        subtasks: tasks[i].subtasks,
        colorOfBar: tasks[i].colorOfBar,
        percentOfDone: tasks[i].percentOfDone,
        pace: tasks[i].pace,
    };

    await backend.setItem('tasks', JSON.stringify(tasks))
    renderTaskCards();
    closeEditCard()
}

/**closes edit card */
function closeEditCard() {
    document.getElementById('dialogFullCard').classList.add('displayNone')
    document.getElementById('dialogEditCard').classList.add('displayNone')
}

/**defines the dragged div */
function startDragging(i) {
    currentDragged = i

}


/**changes readinessState for the dragged div */
async function moveTo(readinessState) {
    tasks = JSON.parse(await backend.getItem('tasks'))
    tasks[currentDragged].readinessState = readinessState
    await backend.setItem('tasks', JSON.stringify(tasks))
    renderTaskCards()
}


/** is the event object representing the drag event-used to prevent the default behavior of the browser, 
 * which would typically not allow dropping elements onto other elements. */
function allowDrop(ev) {
    ev.preventDefault();
}

/**returns in lower case the entered value */
function filterTasks() {
    let search = document.getElementById('findATask').value
    search = search.toLowerCase()
    return search
}


/**clears subsections on board */
function clearSubsections() {
    document.getElementById('boardSubsectionToDo').innerHTML = ''
    document.getElementById('boardSubsectionInProgress').innerHTML = ''
    document.getElementById('boardSubsectionFeedback').innerHTML = ''
    document.getElementById('boardSubsectionDone').innerHTML = ''
}


/**sorts the tasks */
function checkForReadiness(i, j) {
    if (tasks[i].readinessState == 'toDo') {
        document.getElementById('boardSubsectionToDo').innerHTML += HTMLrenderTaskCards(i, j)
        priorityImageForRenderTaskCards(i, j)
    }
    if (tasks[i].readinessState == 'inProgress') {
        document.getElementById('boardSubsectionInProgress').innerHTML += HTMLrenderTaskCards(i, j)
        priorityImageForRenderTaskCards(i, j)
    }
    if (tasks[i].readinessState == 'awaitingFeedback') {
        document.getElementById('boardSubsectionFeedback').innerHTML += HTMLrenderTaskCards(i, j)
        priorityImageForRenderTaskCards(i, j)
    }
    if (tasks[i].readinessState == 'done') {
        document.getElementById('boardSubsectionDone').innerHTML += HTMLrenderTaskCards(i, j)
        priorityImageForRenderTaskCards(i, j)
    }
}


function openTask() {
    document.getElementById('dialogFullCard').classList.remove('displayNone')

}


function closeTask() {
    document.getElementById('dialogFullCard').classList.add('displayNone')
    renderTaskCards();
}


/** manages subtasks(done, not done and counts the general percent of done. 
 * Pace is used as a flag changing when checkbox clicked from initial 0 to 1 */
async function countSubtasks(i, j) {
    tasks = JSON.parse(await backend.getItem('tasks'))

    if (tasks[i].subtasks[j].checkedValue == 0 && tasks[i].pace < tasks[i].subtasks.length) {
        tasks[i].pace++
        countsPercentOfDoneForBarOnBoard(i)
        tasks[i].subtasks[j].checkedValue = 1
    } else {
        if (tasks[i].pace > 0)
            tasks[i].pace--
        countsPercentOfDoneForBarOnBoard(i)
        tasks[i].subtasks[j].checkedValue = 0
    }
    colorOfBar = document.getElementById('progressBar' + i).style.background = `linear-gradient(to right, #29ABE2 ${percentOfDone}%, #e9e7e7 ${percentOfDone}%)`;
    tasks[i].colorOfBar = colorOfBar
    tasks[i].percentOfDone = percentOfDone
    await backend.setItem('tasks', JSON.stringify(tasks))
}


/**counts percent of done for bar on board*/
function countsPercentOfDoneForBarOnBoard(i) {
    let addedSubtaskCheckboxes = document.getElementsByClassName('addedSubtaskOnEdit')
    return percentOfDone = tasks[i].pace / addedSubtaskCheckboxes.length * 100
}



/**If edit task card open, listenes to clicks on reassign contacts div to open it */
function listenToEvent(i) {
    let entireEditTaskCard = document.getElementById('entireEditTaskCard');
    if (entireEditTaskCard) {
        entireEditTaskCard.addEventListener('mouseenter', function () {
            let contactList = document.getElementById('reassignContacts');
            let dropdownAddContact = document.getElementById('editedDropdownAddContact');
            contactList.addEventListener('mouseenter', function () {
                dropdownAddContact.innerHTML = ''
                contacts.forEach((contact, index) => {
                    dropdownAddContact.innerHTML += `<div class="droppedContacts"><a>${contact.name}</a><input onclick="addDeleteReassignedContacts(${i},${index})" id="checkboxAssigned${index}"  type="checkbox"></div>`;
                });
                checkForCheckedAssigned(i)
            });
        });
    }
}


/**keeps track of checked checkboxes for subtasks */
function checkForChecked(i, checkedbox) {
    for (let counter = 0; counter < tasks[i].subtasks.length; counter++) {
        checkedbox = document.getElementById(`checkBox${counter}`)

        if (tasks[i].subtasks[counter].checkedValue == 0) {
            checkedbox.checked = false
        } else { checkedbox.checked = true }
    }
}


function checkForCheckedAssigned(i) {
    let checkedbox
    contacts.forEach((contact, index) => {
        tasks[i].assignedTo.forEach(assigned => {
            checkedbox = document.getElementById(`checkboxAssigned${index}`)
            if (contact.email === assigned.email) {
                checkedbox.checked = true;
            }
        });
    });
}


/**checks the check box for checked property and adds or deletes from assigned contacts*/
async function addDeleteReassignedContacts(i, index) {
    let checkedbox = document.getElementById(`checkboxAssigned${index}`)
    if (checkedbox.checked == true) { addReassigned(i, index) }
    if (checkedbox.checked == false) { deleteReassigned(i, index) }
    await backend.setItem('tasks', JSON.stringify(tasks));
}


/**deletes contacts from assigned*/
function deleteReassigned(i, index) {
    const emailToDelete = contacts[index].email;
    const assignedTo = tasks[i].assignedTo;
    for (let j = assignedTo.length - 1; j >= 0; j--) {
        if (assignedTo[j].email === emailToDelete) {
            assignedTo.splice(j, 1);
        }
    }
}


/**reassigns new contact*/
function addReassigned(i, index) {
    tasks[i].assignedTo.push(contacts[index])
}


/**opens readiness statuses for mobile*/
function openChangeStatus(i, event) {
    let changeStatus = document.getElementById(`dropdown-contentForMobileDevices${i}`);
    if (changeStatus.style.display === 'none') {
        changeStatus.style.display = 'block';
    } else {
        changeStatus.style.display = 'none'
    }
    event = event || window.event;
    event.stopPropagation();
    openChangeStatusContent(i);
    let droppedContent = document.getElementById(`statusesDropdown${i}`);
    if (changeStatus.style.display === 'none') {
        droppedContent.style.display = 'none'
    }
}


/**readiness states for mobile devices*/
function openChangeStatusContent(i) {
    ifStatusToDoForMobile(i)
    ifStatusInProgressForMobile(i)
    ifStatusAwaitingFeedbackForMobile(i)
    ifStatusDoneForMobile(i)
}


/**sets readiness state InProgress*/
async function statusInProgress(i) {
    tasks[i].readinessState = "inProgress"
    await backend.setItem('tasks', JSON.stringify(tasks))
    renderTaskCards(i)
}


/**sets readiness state AwaitingFeedback*/
async function statusAwaitingFeedback(i) {
    tasks[i].readinessState = "awaitingFeedback"
    await backend.setItem('tasks', JSON.stringify(tasks))
    renderTaskCards(i)
}


/**sets readiness state Done*/
async function statusDone(i) {
    tasks[i].readinessState = "done"
    await backend.setItem('tasks', JSON.stringify(tasks))
    renderTaskCards(i)
}


/**sets readiness state toDo*/
async function statusToDo(i) {
    tasks[i].readinessState = "toDo"
    await backend.setItem('tasks', JSON.stringify(tasks))
    renderTaskCards(i)
}


/**colors the chosen priority button */
function colorPriosForEditTask(i) {
    let selectedUrgency = checkForPrioOnEditTask()
    if (selectedUrgency == 'urgent') {
        document.getElementById("prio" + 4).src = "./assets/img/urgentOnclick.png";
        document.getElementById("prio" + 5).src = "./assets/img/mediumImg.png";
        document.getElementById("prio" + 6).src = "./assets/img/lowImg.png";
    }
    if (selectedUrgency == 'medium') {
        document.getElementById("prio" + 5).src = "./assets/img/mediumOnclick.png"
        document.getElementById("prio" + 4).src = "./assets/img/urgentImg.png"
        document.getElementById("prio" + 6).src = "./assets/img/lowImg.png"
    }
    if (selectedUrgency == 'low') {
        document.getElementById("prio" + 6).src = "./assets/img/lowOnclick.png"
        document.getElementById("prio" + 4).src = "./assets/img/urgentImg.png"
        document.getElementById("prio" + 5).src = "./assets/img/mediumImg.png"
    }


    /**returns selected urgency for task */
    function checkForPrioOnEditTask(selectedUrgency) {
        selectedUrgency = tasks[i].prio
        return selectedUrgency
    }
}







