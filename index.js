const BASE_URL = 'http://localhost:8000'
let mode='CREATE'//default mode
let selectedId=''

window.onload = async() => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');   
  console.log('id', id)

  // กำหนดค่าวันเวลาปัจจุบันให้กับ input date_time
  let date_timeDOM = document.querySelector('input[name=date_time]');
  if (date_timeDOM) {
    let now = new Date();
    
    // ปรับเวลาเป็นโซนประเทศไทย
    let thailandTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));

    // แปลงรูปแบบให้เหมาะกับ input datetime-local (YYYY-MM-DDTHH:MM)
    let formattedDateTime = thailandTime.toISOString().slice(0, 16);

    date_timeDOM.value = formattedDateTime;
  }

  if(id){
    mode='EDIT'
    selectedId=id
    
    try{
      const response = await axios.get(`${BASE_URL}/users/${id}`)
      const restaurant=response.data

    let firstNameDOM = document.querySelector('input[name=firstname]');
    let lastNameDOM = document.querySelector('input[name=lastname]');
    let personDOM = document.querySelector('input[name=person]');
    let descriptionDOM = document.querySelector('textarea[name=description]');
      
    firstNameDOM.value=restaurant.firstname
    lastNameDOM.value=restaurant.lastname
    personDOM.value=restaurant.person
    descriptionDOM.value=restaurant.description

    let date_timeDOM = document.querySelector('input[name=date_time]');
    
    let telDOM = document.querySelector('input[name=tel]');

    date_timeDOM.value=restaurant.date_time
    telDOM.value=restaurant.tel
    
    }catch(error){
      console.log('error', error)
    }
  }
}

const validateData = (userData) => {
  let errors = []
  if (!userData.firstname) {
    errors.push ('Firstname')
  }
  if (!userData.lastname) {
    errors.push ('Lastname')
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
  return errors;
}

const submitData = async () => {
  let firstNameDOM = document.querySelector('input[name=firstname]');
  let lastNameDOM = document.querySelector('input[name=lastname]');
  let personDOM = document.querySelector('input[name=person]');
  let date_timeDOM = document.querySelector('input[name=date_time]'); 
  let telDOM = document.querySelector('input[name=tel]');
  let descriptionDOM = document.querySelector('textarea[name=description]');

  let messageDOM = document.getElementById('message');

  try {

    let userData = {
      firstname: firstNameDOM ? firstNameDOM.value : "",
      lastname: lastNameDOM ? lastNameDOM.value : "",
      person: personDOM ? personDOM.value : "",
      date_time: date_timeDOM ? date_timeDOM.value : "",
      tel: telDOM ? telDOM.value : "",
      description: descriptionDOM ? descriptionDOM.value : ""
  };
    console.log('submitData', userData);

    // เอาไว้ตรวจสอบว่ามีไหนว่างเปล่า
    let errors = validateData(userData);
    if (errors.length > 0) {
      messageDOM.innerHTML = `<div>กรุณากรอกข้อมูล: ${errors.join(', ')}</div>`;
      messageDOM.className = 'message danger';
      return;
    }

   let message = 'การจองสำเร็จ'
    if(mode=='CREATE'){
      const response = await axios.post(`${BASE_URL}/users`, userData)
      console.log('response', response.data);
    }else{
      const response = await axios.put(`${BASE_URL}/users/${selectedId}`, userData)
      message = 'เปลี่ยนแปลงข้อมูลการจองสำเร็จ'
      console.log('response', response.data);
    }

    setTimeout(() => {
      window.location.href = "user.html";
    }, 500);

    messageDOM.innerText = message
    messageDOM.className = 'message success'
  } catch (error) {
    console.log('error message', error.message);
    console.log('error', error.errors);

    // ดึง Element ของข้อความแจ้งเตือน
    let messageDOM = document.getElementById('message');
    
    if (error.response) {
      console.log("err.response",error.response.data.message);
      error.message = error.response.data.message
      error.errors = error.response.data.errors
    }

    let htmlData = '<div>'
    htmlData += `<div> ${error.message} </div>`
    htmlData += '<ul>'
    for (let i = 0; i < error.errors.length; i++) {
      htmlData += `<li> ${error.errors[i]} </li>`
    }
    htmlData += '</ul>'
    htmlData += '</div>'

    messageDOM.innerHTML = htmlData
    messageDOM.className = 'message danger'
  }

}
