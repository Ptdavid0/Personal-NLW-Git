import express, { request, response } from 'express'

const app = express();

app.get('/users', (request,response) =>{
  return response.json(["Andre","Oliver","Amanda"])
})

app.listen(3333)