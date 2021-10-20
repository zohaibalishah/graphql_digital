/* eslint-disable max-lines */
const Resize = require('./resize')
const upload = require('../lib/utils/upload')
const knex = require('../lib/db')

const express = require('express')
const fs = require('fs')

const ServiceImageRoute = express.Router()

// Recieve Images

ServiceImageRoute.post('/upload-passport-image', upload.single('image'), async (req, res) => {
  const aws_user_id = req.currentUser.aws_user_id
  const filename = req.file.originalname
  const passport_image_url = `https://api.digitallapi.com/images/passport-images/${filename}`

  const imagePath = '/var/images/passport-images'

  // Error Handling
  if (!fs.existsSync(imagePath)) {
    fs.mkdirSync(imagePath)
  }
  if (!filename) {
    res.status(422).json({ error: 'No filename' })
  }

  // File Upload
  const fileUpload = new Resize(imagePath)
  if (!req.file) {
    res.status(422).json({ error: 'Please provide an image' })
  }
  try {
    await fileUpload.save(req.file.buffer, filename)
    const [return_images] = await knex('kyc')
      .select('passport_image_url')
      .where({ aws_user_id })
    if (return_images && return_images.passport_image_url) {
      const local_url = return_images.passport_image_url
      await knex('kyc')
        .where({ aws_user_id })
        .delete()
      const arr = local_url.split('.com')
      const name = `/var${arr[arr.length - 1]}`
      fs.unlinkSync(name)
    }
    await knex('kyc')
      .update({
        passport_image_url,
      })
    res.json({ passport_image_url })
  } catch (error) {
    console.log(error)
    res.json({ error })
  }
})

ServiceImageRoute.post('/upload-bill-image', upload.single('image'), async (req, res) => {
  const filename = req.file.originalname
  const aws_user_id = req.currentUser.aws_user_id
  const bill_image_url = `https://api.digitallapi.com/images/bill-images/${filename}`

  const imagePath = '/var/images/bill-images'

  // Error Handling
  if (!fs.existsSync(imagePath)) {
    fs.mkdirSync(imagePath)
  }
  if (!filename) {
    res.status(422).json({ error: 'No filename' })
  }

  // File Upload
  const fileUpload = new Resize(imagePath)
  if (!req.file) {
    res.status(422).json({ error: 'Please provide an image' })
  }
  try {
    await fileUpload.save(req.file.buffer, filename)
    const [return_images] = await knex('kyc')
      .select('bill_image_url')
      .where({ aws_user_id })
    if (return_images && return_images.bill_image_url) {
      const local_url = return_images.bill_image_url
      await knex('kyc')
        .where({ aws_user_id })
        .delete()
      const arr = local_url.split('.com')
      const name = `/var${arr[arr.length - 1]}`
      fs.unlinkSync(name)
    }
    await knex('kyc')
      .update({
        bill_image_url,
      })
    res.json({ bill_image_url })
  } catch (error) {
    console.log(error)
    res.json({ error })
  }
})

// Retrieve Images

ServiceImageRoute.get('/list-passport-images', (req, res) => {
  const groups = req.currentUser.groups
  if (!groups || !groups.includes('superadmin')){
    console.log('not authorized', { req })
    res.sendStatus(403)
  }
  res.send(fs.readdirSync('/var/images/passport-images'))
})

ServiceImageRoute.get('/list-bill-images', (req, res) => {
  const groups = req.currentUser.groups
  if (!groups || !groups.includes('superadmin')){
    console.log('not authorized', { req })
    res.sendStatus(403)
  }
    res.send(fs.readdirSync('/var/images/bill-images'))
})

ServiceImageRoute.get('/bill-images/:filename', (req, res, next) => {
  const groups = req.currentUser.groups
  if (!groups || !groups.includes('superadmin')){
    console.log('not authorized', { req })
    res.sendStatus(403)
  }
  const filename = req.params.filename
  if (!filename) {
      res.status(422).json({ error: 'No filename' })
  }
  var options = {
      headers: {
          'x-timestamp': Date.now(),
          'x-sent': true
      }
  }
  res.sendFile(`/var/images/bill-images/${filename}`, options, err => {
      if (err) {
          next(err)
        } else {
          console.log('Sent:', filename)
        }
  })
})

ServiceImageRoute.get('/passport-images/:filename', (req, res, next) => {
  const groups = req.currentUser.groups
  if (!groups || !groups.includes('superadmin')){
    console.log('not authorized', { req })
    res.sendStatus(403)
  }
  const filename = req.params.filename
  if (!filename) {
      res.status(422).json({ error: 'No filename' })
  }
  var options = {
      headers: {
          'x-timestamp': Date.now(),
          'x-sent': true
      }
  }
  res.sendFile(`/var/images/passport-images/${filename}`, options, err => {
      if (err) {
          next(err)
        } else {
          console.log('Sent:', filename)
        }
  })
})

module.exports = ServiceImageRoute

