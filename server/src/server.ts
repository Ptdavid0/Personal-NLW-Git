import express from 'express'
import path from 'path'
import routes from "./routes"
import cors from 'cors'

const app = express();
//Deve vir antes das rotas sempre
app.use(cors())

app.use(express.json())
app.use(routes)

app.use('/uploads', express.static(path.resolve(__dirname, '..' , 'uploads')))

app.listen(3333)