import express from "express"
import { Router } from "express"
import PointsController from './controllers/PointsController'
import ItemsController from './controllers/ItemsController'
import multer from 'multer'
import multerConfig from './config/multer'

const routes = Router()
const upload = multer(multerConfig)


const pointsController = new PointsController();
const itemsController = new ItemsController()

routes.get('/items', itemsController.index)
routes.get('/points',pointsController.index)
routes.get('/points/:id',pointsController.show)

routes.post('/points', upload.single('image') , pointsController.create);


export default routes

//Index  -> Listagem
//Show   -> Exibir um unico Registro
//Create -> Criar algo novo
//Update
//Delete or Destroy