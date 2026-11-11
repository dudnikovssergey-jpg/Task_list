const readline = require('readline')
const fs = require('fs')
const express = require('express')
const db = require('./dataBase')
const app = express()
app.use(express.json())
app.use(express.static('public'))
const rl = readline.createInterface({
    input: process.stdin,
    output:process.stdout
})

let TaskList = []

app.get("/", (req, res) => {
    res.send("Сервер работает")
})

app.get("/about", (req, res) => {
    res.send('Это проект списка задач')
})



// app.get("/tasks", (req, res) => {
//     loadTasks()
//     const priority = req.query.priority
//     const completed = req.query.completed
//     const sort = req.query.sort
//     const order = req.query.order
//     let result = [...TaskList]
//     if(completed === "true") {
//        return res.json(TaskList.filter(task => task.completed === true)) 
//     } if (completed === "false") {
//        return res.json(TaskList.filter(task => task.completed === false)) 
//     }
//     if(priority) {
//         const filtered_tasks = TaskList.filter(task => {
//             return task.priority === priority
//         })
//         return res.json(filtered_tasks)
//     } 

//     if(sort === "id") {
//         result.sort((a, b) => a.id - b.id)
//     } if(sort === "title") {
//         result.sort((a, b) => {
//             return a.title.localeCompare(b.title)
//         })
//     }

//     if(order === "desc") {
//         result.reverse()
//     }

//     if(sort) {
//         return res.json(result)
//     }

app.get("/tasks", (req, res) => {
    const completed = req.query.completed
    const sort = req.query.sort
    const order = req.query.order
    const priority = req.quary.priority
    if(priority) {
       const tasks = db.prepare(`
      SELECT *
      FROM tasks
      WHERE priority = ?  
    `).all(priority)
    res.json(tasks)  
    }
    if(completed === 'true') {
        const tasks = db.prepare(`
                SELECT * 
                FROM TASKS
                WHERE completed = 1
            `)
        return res.json(tasks)
    }
    if(completed === 'false') {
        const tasks = db.prepare(`
                SELECT * 
                FROM TASKS
                WHERE completed = 0
            `)
        return res.json(tasks)
    }
    if(sort === 'id' && order === "asc") {
        const tasks = db.prepare(`
                SELECT * 
                FROM TASKS
                ORDER BY id ASC
            `)
         return res.json(tasks)
    }
    if(sort === 'id' && order === "desc") {
        const tasks = db.prepare(`
                SELECT * 
                FROM TASKS
                ORDER BY id DESC
            `)
         return res.json(tasks)
    }
    if(sort === 'title' && order === "asc") {
         const tasks = db.prepare(`
                SELECT * 
                FROM TASKS
                ORDER BY title ASC
            `)
         return res.json(tasks)
    }
     if(sort === 'title' && order === "desc") {
         const tasks = db.prepare(`
                SELECT * 
                FROM TASKS
                ORDER BY title DESC
            `)
         return res.json(tasks)
    }
    const tasks = db.prepare(`
        SELECT *
        FROM tasks  
    `).all()
    res.json(tasks) 
}

    // const letter = req.query.letter
    // let found = false
    // if(letter) { 
    //     for(let i = 0; i < TaskList.length; i++) {
    //         if(TaskList[i][0] === letter) {
    //             found = true
    //             return res.json(TaskList[i])
    //         }
    //     }
    // } 
    // if (found) {
    //     return
    // }

    if(TaskList.length === 0) {
        res.json({
            "message": "Задач пока нет"
        })
    } else{
        res.json(TaskList)
    }    
})

app.get("/info", (req, res) => {
    res.json({
        'name': 'TaskList API',
        'version': '1.0'
    })
})

app.get("/tasks/count", (req, res) => {
    loadTasks()
    res.json({
        'TasksCount': TaskList.length
    })
})

app.get("/status", (req, res) => {
    res.json({
        'server': 'ok',
        "tasksCount": TaskList.length
    })
})

app.get("/tasks/:id_task", (req, res) => {
    loadTasks()
    let idtask = Number(req.params.id_task)
    const task = TaskList.find(task => task.id === idtask)
    if(!task) {
        return res.status(404).json({
            message: "Задач таких нет"
        })
    }
    return res.status(200).json(task)
})

app.post("/tasks", (req, res) => {
    // console.log(req.body)
    // res.send('Запрос получен')
    if(!req.body.title || req.body.title.trim() === '') {
        return res.status(400).json({
           message: 'Название задач не может быть пустым'  
        }) 
    }
    const priorities = ["low", "normal", "high"]
    if(req.body.priority && !priorities.includes(req.body.priority)) {
        return res.status(400).json({
            message: 'Некорректно введен приоритет'
        })
    }
    let next_id = 1
    if(TaskList.length > 0) {
        next_id = Math.max(...TaskList.map(task => task.id)) + 1
    }
    const newTask = {
        id: next_id,
        title: req.body.title,
        priority: req.body.priority,
        completed: false
    }
    TaskList.push(newTask)
    saveTasks()
    res.status(201).json(newTask)
})

app.delete("/tasks/:id_task", (req, res) => {
    let delete_id_task = Number(req.params.id_task)
    const task_index = TaskList.findIndex(task => task.id === delete_id_task)
     if(task_index === -1) {
        return res.status(404).json({
            message: "Задач таких нет"
        })
    }
    TaskList.splice(task_index, 1)
    saveTasks()
    res.status(200).json({
        message: "Задача удалена"
    })
})

app.patch("/tasks/:id_task", (req, res) => {
    let id_task = Number(req.params.id_task)
    const task_ = TaskList.find(task => task.id === id_task)

    if(!task_) {
        return res.status(404).json({
            message: "Задач таких нет"
        })
    }
    if(req.body.title !== undefined && req.body.title.trim() ==="") {
        return res.status(400).json({
            message: "Название задач не может быть пустым"
        })    
    } 

    let priorities = ["low", 'normal', 'high']
    if(req.body.priority !== undefined && !priorities.includes(req.body.priority)) {
        return res.status(400).json({
             message: "неккоректный приоритет"
        })
    } 
    if(req.body.completed !== undefined && typeof req.body.completed !== 'boolean') {
        return res.status(400).json({
            message: "completed должно быть true или false"
        })
    } if(req.body.title !== undefined) {
        task_.title = req.body.title
    }   if(req.body.description !== undefined) {
        task_.description = req.body.description
    } if(req.body.completed !== undefined) {
        task_.completed = req.body.completed
    }  if(req.body.priority !== undefined) {
        task_.priority = req.body.priority
    } 

    saveTasks()
    res.status(200).json({
        message: "Задача обновлена"
    })
})

app.patch("/tasks/:id_task/toggle", (req, res) => {
    let id_task = Number(req.params.id_task)
    const task_ = TaskList.find(task => task.id === id_task)

    if(!task_) {
        return res.status(404).json({
            message: "Задач таких нет"
        })
    }
    task_.completed = !task_.completed
    saveTasks()
    res.status(200).json({
        message: "Задача обновлена"
    })
})

function saveTasks() {
    let TaskList_json = JSON.stringify(TaskList, null, 2)
    fs.writeFileSync('TaskList.json', TaskList_json)
}

function loadTasks() {
    if(fs.existsSync('TaskList.json')) {
        let TaskList_json = fs.readFileSync('TaskList.json', 'utf-8')
        TaskList = JSON.parse(TaskList_json)
    }
}

function show_TaskList() {
    if (TaskList.length === 0) {
       console.log('Задач пока нет') 
    }
    for (let i = 0; i < TaskList.length; i++) {
        console.log(`${i+1}. ${TaskList [i]}`);   
    }
    menu()    
}

function show_Quantity_TaskList() {
    if (TaskList.length === 0) {
       console.log('Задач: 0') 
    } else {
        console.log(`Количество задач: ${TaskList.length}.`);   
    }
    menu()
}       
function show_menu() {
    console.log('Главное меню')
    console.log('1 Посмотреть задачи')
    console.log('2 Добавить задачу')
    console.log('3 удалить задачу')
    console.log('4 Показать количество задач')
    console.log('5 Удалить все задачи')
    console.log('0 Выход')
    
}
function addTask() {
    rl.question('Введите название задачи: ', (name) => {
        TaskList.push(name)
        saveTasks()
        console.log(`Задача "${name}" добавлена!`)
        console.log('Текущий список задач:')
        show_TaskList()
        menu() 
    })
}
function delete_Task() {
    rl.question('Введите номер удаляемой задачи:', (number) => {
        let task_index = Number(number)-1
        if(task_index < 0 || task_index >= TaskList.length) {
            console.log('Неправильный номер задачи')
            menu()
        } else {
            TaskList.splice(task_index, 1)
            saveTasks()
        console.log('Задача успешно удалена')
        console.log('Текущий список задач:')
        show_TaskList()
        menu() 
        }
        
    })
}

function delete_all_Task() {
    rl.question('Вы точно хотите удалить все задачи:', (answer) => {
        if(answer === 'Да') {
            TaskList.length = 0
            saveTasks()
            console.log('Все задачи удалены')
            menu()
        } else if(answer === 'Нет'){
           console.log('Задача отменена')
            menu() 
        } else {
            console.log('Ошибка')
            menu()
        }
    })
}

function menu() {
    show_menu()  
    rl.question('Введите номер:', (number) => {
        if(number === '0') {
            console.log('Программа завершена, до свидания')
            rl.close()
        } else if (number === '1') {
            show_TaskList()
            
        } else if (number === '2') {
            addTask()
            
        } else if (number === '3') {
           delete_Task() 
           
        } else if (number === '4') {
           show_Quantity_TaskList() 
        }
        else if (number === '5') {
           delete_all_Task()
        }
    })  
}

loadTasks()
menu()

app.listen(3000, () => {
    console.log('Сервер запущен на порту 3000')
})