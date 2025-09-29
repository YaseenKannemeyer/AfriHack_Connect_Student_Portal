let data;

// ================================
// 0️⃣ Load JSON data from data.json
// ================================
fetch('data.json')
  .then(res => res.json())
  .then(json => {
    data = json;
    initApp();
  })
  .catch(err => console.error('Failed to load JSON:', err));

// ================================
// 1️⃣ Initialize app after JSON is loaded
// ================================
function initApp() {
  // Prompt for user ID
  let currentUser;
  while (!currentUser) {
    const currentUserID = Number(prompt("Enter your ID:"));
    currentUser = data.users.find(u => u.ID === currentUserID);
    if (!currentUser) alert("User not found! Please try again.");
  }

  // Show the correct form
  if (currentUser.role === "parents") document.getElementById('parent-form').style.display = 'block';
  if (currentUser.role === "teacher") document.getElementById('teacher-form').style.display = 'block';

  // Update header
  document.getElementById('user-greeting').textContent = `Logged in as ${currentUser.details.name}`;

  // ================================
  // Populate dropdowns
  // ================================
  if (currentUser.role === "parents") {
    const teacherSelect = document.getElementById('parent-teacher');
    currentUser.details.childTeachers.forEach(tName => {
      const [name, dept] = tName.split(" - ");
      const teacherObj = data.users.find(u => u.role === "teacher" && u.details.name === name.trim());
      if (teacherObj) {
        const option = document.createElement('option');
        option.value = teacherObj.ID;
        option.textContent = tName;
        teacherSelect.appendChild(option);
      }
    });
  }

  if (currentUser.role === "teacher") {
    const classSelect = document.getElementById('teacher-class');
    currentUser.details.classes.forEach(cls => {
      const option = document.createElement('option');
      option.value = cls;
      option.textContent = cls;
      classSelect.appendChild(option);
    });
  }

  // ================================
  // Connect WebSocket
  // ================================
  const ws = new WebSocket('ws://localhost:8080');

  ws.onopen = () => {
    ws.send(JSON.stringify({
      type: 'register',
      id: currentUser.ID,
      userType: currentUser.role,
      name: currentUser.details.name,
      avatar: currentUser.details.profilePic
    }));
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    // ✅ Only show messages meant for this user or for all
    if (msg.type === 'message' && (msg.to === currentUser.ID || msg.to === 'all')) {
      addNotification(msg.from, msg.subject, msg.message, msg.avatar);
    }
  };

  // ================================
  // Add notification to DOM
  // ================================
  function addNotification(from, subject, message, avatar) {
    const ul = document.getElementById('notifications');
    const li = document.createElement('li');
    li.innerHTML = `
      <img src="${avatar}" alt="avatar">
      <div class="notification-content">
        <span class="from">${from}</span>
        <span class="subject">${subject}</span>
        <span class="message">${message}</span>
      </div>
    `;
    ul.prepend(li);
  }

  // ================================
  // Parent send
  // ================================
  document.getElementById('parent-send')?.addEventListener('click', () => {
    const teacherID = Number(document.getElementById('parent-teacher').value);
    const teacherObj = data.users.find(u => u.ID === teacherID);
    if (!teacherObj) return alert("Teacher not found!");

    const subject = document.getElementById('parent-subject').value.trim();
    const message = document.getElementById('parent-body').value.trim();
    if (!subject || !message) return alert("Please fill subject and message.");

    ws.send(JSON.stringify({
      type: 'message',
      from: currentUser.details.name,
      to: teacherObj.ID,
      subject,
      message,
      avatar: currentUser.details.profilePic
    }));

    addNotification(`You → ${teacherObj.details.name}`, subject, message, currentUser.details.profilePic);

    document.getElementById('parent-subject').value = '';
    document.getElementById('parent-body').value = '';
  });

  // ================================
  // Teacher send
  // ================================
  document.getElementById('teacher-send')?.addEventListener('click', () => {
    const toAll = document.getElementById('send-all').checked;
    let recipient = "all";
    let recipientName = "All Parents";

    if (!toAll) {
      const studentID = document.getElementById('student-search').value.trim();
      if (!studentID) return alert("Please enter a student ID!");

      const parentObj = data.users.find(u => u.role === 'parents' && u.details.childID == studentID);
      if (!parentObj) return alert("Student not found!");

      recipient = parentObj.ID;
      recipientName = parentObj.details.name;
    }

    const subject = document.getElementById('teacher-subject').value.trim();
    const message = document.getElementById('teacher-body').value.trim();
    if (!subject || !message) return alert("Please fill subject and message.");

    ws.send(JSON.stringify({
      type: 'message',
      from: currentUser.details.name,
      to: recipient,
      subject,
      message,
      avatar: currentUser.details.profilePic
    }));

    addNotification(`You → ${recipientName}`, subject, message, currentUser.details.profilePic);

    document.getElementById('teacher-subject').value = '';
    document.getElementById('teacher-body').value = '';
    document.getElementById('student-search').value = '';
    document.getElementById('send-all').checked = false;
  });
}