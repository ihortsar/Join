
function listenToEvent(i) {
    if (reassignContactsOnEdit == false) {
        ifReassignContactsOnEditFalse(i)
        checkForCheckedAssignedOnEdit(i)
    } else {
        document.getElementById('editedDropdownAddContact').style.display = 'none'
        reassignContactsOnEdit = false
    }
    event.stopPropagation()
}


function ifReassignContactsOnEditFalse(i) {
    reassignContactsOnEdit = true
    document.getElementById('editedDropdownAddContact').style.display = 'block'
    let dropdownAddContact = document.getElementById('editedDropdownAddContact');
    dropdownAddContact.innerHTML = ''
    contacts.forEach((contact, index) => {
        dropdownAddContact.innerHTML += `<div class="droppedContacts"><a>${contact.name}</a><input onclick="addDeleteReassignedContacts(${i},${index})" id="checkboxAssigned${index}"  type="checkbox"></div>`;
    });
}


function listenFullCard() {
    let dialogFullCard = document.getElementById('dialogFullCard')
    if (dialogFullCard) {
        dialogFullCard.addEventListener('click', function (event) {
            if (event.target === this) {
                closeTask()
            }
        })
    }
}


function listenEditCard() {
    let dialogEditCard = document.getElementById('dialogEditCard')
    if (dialogEditCard) {
        dialogEditCard.addEventListener('click', function (event) {
            if (event.target === this) {
                closeEditCard()
            }
        })
    }
}


function listenAddTaskPopUp() {
    let addTaskPopUp = document.getElementById('addTaskPopUp')
    if (addTaskPopUp) {
        addTaskPopUp.addEventListener('click', function (event) {
            if (event.target === this) {
                closePopUpAddTask()
            }
        })
    }
}