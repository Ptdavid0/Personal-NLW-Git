import express from 'express'
import path from 'path'
import routes from "./routes"
import cors from 'cors'

const app = express();

app.use(express.json())
app.use(routes)
app.use(cors())

app.use('/uploads', express.static(path.resolve(__dirname, '..' , 'uploads')))

app.listen(3333)