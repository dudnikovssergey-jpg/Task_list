

const input = document.getElementById('taskInput')
const btn = document.getElementById('addButton')
const priority = document.getElementById('prioritySelect')
const tasklist = document.querySelector('.taskList')
const editTAsk =  document.getElementById('editTask')
const editPrioritySelect =  document.getElementById('editPrioritySelect')
const saveEditBtn =  document.querySelector('.saveEditBtn')
const cancelEditBtn =  document.querySelector('.cancelEditBtn')
const modelWindow =  document.getElementById('modelWindow')
let edit_task_id = null

function loadTasks() {
    fetch('/tasks')
        .then(response => response.json())
        .then(tasks => {
            renderTasks(tasks)
        })
}
function renderTasks(tasks) {
    tasklist.innerHTML = ''
    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i]
        const div = document.createElement('div')
        div.className = 'task'
        if(task.priority === "high") {
            div.classList.add('high')
        } if(task.priority === "normal") {
            div.classList.add('normal')
        } if(task.priority === "low") {
            div.classList.add('low')
        }
        if (task.completed) {
            div.classList.add('completed')
        }
        const title = document.createElement('span')
        title.textContent = task.title
        div.appendChild(title)
        div.addEventListener('click', () => {
            toggleTask(task.id, task.completed)
        })
        const edit_button = document.createElement('button')
        edit_button.classList.add('edit_button')
        edit_button.textContent = '✏️'
        edit_button.addEventListener('click', (event) => {
            event.stopPropagation()
            openEditModel(task)
        })
        const div1 = document.createElement('div')
        div1.append(edit_button)
       
        const delete_button = document.createElement('button')
        delete_button.classList.add('delete_button')
        delete_button.textContent = '🗑️'
        delete_button.addEventListener('click', () => {
            deleteButton(task.id)
        })
        div1.append(delete_button)
        div.appendChild(div1)
        tasklist.appendChild(div)
    }
}

function toggleTask(id, completed) {
    fetch(`/tasks/${id}`, {
        method: 'PATCH', 
        headers: {
            "content-Type": "application/json"
        },
        body: JSON.stringify({
            completed: !completed
        })
    })
    .then(response => response.json())
    .then(() => {
        loadTasks()
    })
}

btn.addEventListener('click', () => {
    const title = input.value.trim()
     const priorit = priority.value
     if(title === '') {
        return 
     } 
    fetch('/tasks', {
        method: 'POST',
        headers: {
            "content-Type": "application/json"
        },
        body: JSON.stringify({
            title: title,
            priority: priorit
        
        })
    })
    .then(response => response.json())
    .then(() => {
        input.value = ''
        loadTasks()
    })
})

input.addEventListener('keydown', (event) => {
    if(event.key === 'Enter') {
        btn.click()
    }
})

function deleteButton(id) {
    fetch(`/tasks/${id}`, {
       method: 'DELETE' 
    }) 
    .then(response => response.json())
    .then(() => {
        loadTasks()
    })
}

function openEditModel(task) {
   edit_task_id = task.id
   editTAsk.value = task.title
   editPrioritySelect.value = task.priority 
   modelWindow.style.display = 'flex'
}

cancelEditBtn.addEventListener('click', () => {
    modelWindow.style.display = 'none'
    edit_task_id = null

})

saveEditBtn.addEventListener('click', () => {
    const newTitle = editTAsk.value
    const newPriority = editPrioritySelect.value
    if(newTitle === '') {
        alert('Название задачи не может быть пустым')
        return
    }
     modelWindow.style.display = 'none'
    updateTask(edit_task_id, newTitle, newPriority)
})

function updateTask(id, title, priority) {
    fetch(`/tasks/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, priority })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка ${response.status}: не удалось обновить задачу`);
            }
            return response.json();
        })
        .then(() => {
            loadTasks();
        })
}



loadTasks()

