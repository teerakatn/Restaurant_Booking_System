const BASE_URL = 'http://localhost:8000'

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

window.onload = async () => {
  await loadData()
}

const formatDateTime = (utcDateString) => {
    if (!utcDateString) return '-';

    let date = new Date(utcDateString);

    date.setHours(date.getHours());

    // แปลงให้อยู่ในรูปแบบที่อ่านง่าย
    return date.toLocaleString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
};

/*ฟังชั่นอัปเดตสถานะ */
const updateStatus = async (id, status) => {
  try {
      console.log(`🔄 Updating ID: ${id}, Status: ${status}`);

      if (!id || !status) {
          console.error("⛔ ID or Status is missing!");
          return;
      }

      await axios.put(`${BASE_URL}/users/${id}`, { status: status });

      const statusCell = document.getElementById(`status-${id}`);
      if (statusCell) {
          statusCell.textContent = status;
          statusCell.classList.remove("status-approved", "status-pending");
          if (status === "success") {
              statusCell.classList.add("status-approved");
          }
      } else {
          console.warn(`Element status-${id} not found`);
      }
  } catch (error) {
      console.error('Error update status', error);
  }
};

const loadData = async () => {
  console.log('user page loaded')
  //1. load user ทั้งหมด จาก api ที่เตรียมไว้
  const response = await axios.get(`${BASE_URL}/users`)

  console.log(response.data)

  const userDOM = document.getElementById('restaurant')
  //2. นำ user ทั้งหมด โหลดกลับเข้าไปใน html
 
  //สร้างตารางเพื่อแสดงข้อมูล user
  let htmlData = `
  <table border="1" cellspacing="1" cellpadding="10">
      <thead>
          <tr>
              <th>ID</th>
              <th>Firstname</th>
              <th>Lastname</th>
              <th>person</th>
              <th>date_time</th>
              <th>tel</th>
              <th>Status</th>
              <th>Description</th>
              <th>Action</th>
              <th>Booking</th>
          </tr>
      </thead>
      <tbody id="tableBody">
  `;

  for (let i = 0; i < response.data.length; i++) {
    let users = response.data[i];
    htmlData += `
      <tr>
          <td>${users.id}</td>
          <td>${users.firstname}</td>
          <td>${users.lastname}</td>
          <td>${users.person}</td>
          <td>${formatDateTime(users.date_time)}</td>
          <td>${users.tel}</td>
          <td id="status-${users.id}" class="status">${users.status || 'operation'}</td>
          <td>${users.description || '-'}</td>
          <td>
          <a href="index.html?id=${users.id}">
          <button class='Edit'><i class="fa-solid fa-pen"></i>
          </button></a>
          <button class="delete" data-id="${users.id}"><i class="fa-solid fa-trash"></i>
          </button>
          </td>
          
          <td>
          <a href="booking.html">
          <button class='approve' data-id='${users.id}' data-status='success'><i class="fa-solid fa-check"></i>
          </button></a>
          </td>
          
      </tr>
    `;
  }

  htmlData += `</tbody></table>`;
    userDOM.innerHTML = htmlData;

  //3. สร้าง event สำหรับลบ user
  const deletDOMs = document.getElementsByClassName('delete')
  for (let i = 0; i < deletDOMs.length; i++) {
    deletDOMs[i].addEventListener('click', async (event) => {
      const id = event.target.dataset.id
      try {
        await axios.delete(`${BASE_URL}/users/${id}`)
        loadData()//เรียกใช้ฟังก์ชั่นตัวเองเพื่อโหลดข้อมูลใหม่
      } catch (error) {
        console.log('error', error)
      }
    })
  }
  /*4. สร้าง event สำหรับการค้นหา*/
  const filterDOM = document.getElementById('search');
  filterDOM.addEventListener('keyup', (event) => {
    const filterValue = event.target.value.toLowerCase();
    const rows = document.querySelectorAll("#tableBody tr");

    rows.forEach((row) => {
      const cells = row.getElementsByTagName('td');
      let rowContainsFilterValue = false;

      for (let j = 0; j < cells.length; j++) {
        if (cells[j].innerText.toLowerCase().includes(filterValue)) {
          rowContainsFilterValue = true;
          break;
        }
      }

      row.style.display = rowContainsFilterValue ? '' : 'none';
    });
  });
 /*5. สร้าง event สำหรับการจัดเรียงข้อมูล*/
  document.addEventListener('click', async (event) => {
    if (event.target.closest('.approve')) {
        event.preventDefault();
        const button = event.target.closest('.approve');
        const id = button.dataset.id;
        const status = button.dataset.status;
        console.log(`Approve Clicked: ID=${id}, Status=${status}`);

        if (id && status) {
            await updateStatus(id, status);
            window.location.href = "booking.html"; // ไปยัง booking.html หลังอัปเดต
        } else {
            console.error("ID or Status not found!");
        }
    }
});
  
}
 