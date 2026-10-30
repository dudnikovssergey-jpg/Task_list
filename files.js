const fs = require('fs')
let tasks = ['1. поесть', '2. сделать стул', '3. Снять видео']
let tasks_json = JSON.stringify(tasks, null, 2)
// fs.writeFileSync('file.json', tasks_json)
const data = fs.readFileSync('file.json', 'utf-8')
const tasks2 = JSON.parse(data)
console.log(tasks2)

