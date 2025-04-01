const express = require('express')
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const app = express();
const cors = require('cors');


const port = 8000;

app.use(bodyParser.json());

app.use(cors());

let restaurant = []

let conn=null

const initMySQL = async () => {
   conn= await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'webdb',
    port: 8820
  
  })
}
const validateData = (userData) => {
  let errors = []
  if (!userData.firstname) {
    errors.push ('ชื่อผู้จอง')
  }
  if (!userData.lastname) {
    errors.push ('นามสกุล')
  }
  if (!userData.person) {
    errors.push ('จำนวนคน')
  }
  if (!userData.date_time) {
    errors.push ('วันเวลาที่ต้องการจอง')
  }
  if (!userData.tel) {
    errors.push ('ข้อมูลการติดต่อ')
  }
  if (!userData.description) {
    errors.push ('รายละเอียดเพิ่มเติม')
  }
  return errors
}

// path = GET /users สำหรับ get users ทั้งหมดที่บันทึกไว้
app.get('/users',async (req, res) => {
  const results = await conn.query('SELECT * FROM restaurant')
  res.json(results[0])
})

// path = POST /user สำหรับสร้าง user ใหม่
app.post('/users',async (req, res) => {
 
  try{
    let restaurant = req.body;
    const errors = validateData(restaurant)
    if (errors.length > 0) {
      throw {
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        errors: errors
      }
    }
    const results= await conn.query('INSERT INTO restaurant SET ?', restaurant)
    res.json({
      message: 'การจองสำเร็จ',
      data: results[0]
    }) 
  }catch(error){
    const errorMesssage = error.message || 'something went wrong'
    const errors = error.errors || []
    console.error('error:', error.message)
    res.status(500).json({
      message: errorMesssage,
      errors: errors,
    })
  }
}) 

// path = GET /users/:id สำหรับ ดึง users รายคนออกมา
app.get('/users/:id', async (req, res) => {
  try {
    let id = req.params.id;
    const results = await conn.query('SELECT * FROM restaurant WHERE id = ?', id)
    if (results[0].length == 0) {
      throw{ statusCode: 404, message: 'user not found'}
    }
      res.json(results[0][0])
     
    } catch (err) {
      console.log('error', err.message)
      let statusCode = err.statusCode || 500
      res.status(500).json({
        message: 'something went wrong',
        errorMesssage: err.message
      })
  } 
}) 

// path: PUT /users/:id สำหรับแก้ไข users รายคน (ตาม id ที่บันทึกเข้าไป)
app.put('/users/:id',async (req, res) => {

  try{
    let id = req.params.id;
    let updateUser = req.body;
    let user = req.body;
    const results= await conn.query(
      'UPDATE restaurant SET ? WHERE id=?', [updateUser, id]
    )
    res.json({
      message: 'เปลี่ยนแปลงข้อมูลการจองสำเร็จ',
      data: results[0]
    }) 
  }catch(err){
    res.status(500).json({
      message: 'something went wrong',
      errorMesssage: err.message
    })
  }
})

//path: DELETE /users/:id สำหรับลบ users รายคน ตาม id ที่บันทึกเข้าไป)
app.delete('/users/:id',async (req, res) => {
  try{
    let id = req.params.id;
    const results= await conn.query('DELETE from restaurant WHERE id=?',[id])
    res.json({
      message: 'ลบข้อมูลการจองสำเร็จ',
      data: results[0]
    }) 
  }catch(err){
    console.log('error', err.message)
    res.status(500).json({
      message: 'something went wrong',
      error: err.message
    })
  }
})

//เช็กว่า conn ถูกสร้างหรือยัง
  app.listen(port,async (req,res) => {
      await initMySQL();
    console.log('http server is running on port'+port)
  })
