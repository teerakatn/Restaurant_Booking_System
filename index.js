const BASE_URL = 'http://localhost:8000'
let mode='CREATE'//default mode
let selectedId=''
/*hamburger*/ 
function toggleHamburgerIcon(el) {
  el.classList.toggle("change");
}

const myMenu = document.getElementById("myMenu");
const hamIcon = document.getElementById("hamIcon");

hamIcon.addEventListener("click", function() {
  if (myMenu.style.display === "block") {
      myMenu.style.display = "none";
  } else {
      myMenu.style.display = "block";
  }
});

/*ฟังก์ชันสำหรับโหลดข้อมูลจาก API*/
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

/*โหมดเเก้ไขชื่อผู้ใช้*/
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

    if (restaurant.date_time) {
      let dateObj = new Date(restaurant.date_time);// ใช้วันที่จากฐานข้อมูล
      dateObj.setHours(dateObj.getHours()+7);
      let formattedDateTime = dateObj.toISOString().slice(0, 16); // แปลงเป็น YYYY-MM-DDTHH:MM
      date_timeDOM.value = formattedDateTime;
  }
    
    let telDOM = document.querySelector('input[name=tel]');

  
    telDOM.value=restaurant.tel
    
    }catch(error){
      console.log('error', error)
    }
  }
}

/*ฟังก์ชันสำหรับโหลดข้อมูลจาก API ใช้เพื่อเช็คว่ามีข้อมูลซ้ำหรือไม่*/
const checkDuplicate = async (userData) => {
  try {
    const response = await axios.get(`${BASE_URL}/users`);
    const users = response.data;
    
    return users.some(user => 
      user.firstname === userData.firstname &&
      user.lastname === userData.lastname &&
      new Date(user.date_time).getTime() === new Date(userData.date_time).getTime()
    );
  } catch (error) {
    console.log('Error checking duplicate:', error);
    return false;
  }
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
      firstname: firstNameDOM.value,
      lastname: lastNameDOM.value,
      person: personDOM.value,
      date_time: date_timeDOM.value,
      tel: telDOM.value,
      description: descriptionDOM.value
  };
    console.log('submitData', userData);

    const isDuplicate = await checkDuplicate(userData);
    if (isDuplicate) {
      messageDOM.innerText = 'มีการจองในช่วงเวลานี้แล้ว';
      messageDOM.className = 'message danger';
      return;
    }

  /*โหมด Edit เเก้ไขหน้าregisterหรือindex*/
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
    }, 1000);

    messageDOM.innerText = message
    messageDOM.className = 'message success'
  } catch (error) {
    console.log('error message', error.message);
    console.log('error', error.errors);

    /*ข้อความเเจ้งเตือนเวลากรอกข้อมูลไม่ครบหรือผิดพลาด*/
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
