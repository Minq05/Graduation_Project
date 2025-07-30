import path from 'path'
import express from 'express'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const configViewEngine = (app: any) => {
  app.set('views', path.join('./src', 'views'))
  app.set('view engine', 'ejs')

  //config static files: image/css/js
  app.use(express.static(path.join('./src', 'public')))
}

export default configViewEngine
