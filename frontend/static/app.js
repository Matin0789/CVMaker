function updateDebugStatus(message) {
  const debugStatus = document.getElementById('debug-status');
  if (debugStatus) {
    debugStatus.textContent = message;
    console.log('Debug Status:', message);
  }
}

async function fetchGraphQL(query, variables) {
  updateDebugStatus('Sending GraphQL request...');
  const res = await fetch('/graphql/', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  const json = await res.json();
  if (json.errors) { 
    console.error('GraphQL errors:', json.errors);
    updateDebugStatus('GraphQL errors: ' + json.errors.map(e => e.message).join(', '));
  }
  updateDebugStatus('GraphQL response received');
  return json.data;
}

function text(el, value) { if (el) el.textContent = value || ''; }
function html(el, value) { if (el) el.innerHTML = value || ''; }

function formatDateRange(start, end) {
  const s = new Date(start).toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
  const e = end ? new Date(end).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Present';
  return `${s} — ${e}`;
}

// Modal functionality
function openModal() {
  document.getElementById('editModal').style.display = 'block';
  populateEditForm();
}

function closeModal() {
  document.getElementById('editModal').style.display = 'none';
}

function populateEditForm() {
  if (!currentPerson) return;
  
  document.getElementById('edit_full_name').value = currentPerson.fullName || '';
  document.getElementById('edit_title').value = currentPerson.title || '';
  document.getElementById('edit_email').value = currentPerson.email || '';
  document.getElementById('edit_phone').value = currentPerson.phone || '';
  document.getElementById('edit_location').value = currentPerson.location || '';
  document.getElementById('edit_photo_url').value = currentPerson.photoUrl || '';
  document.getElementById('edit_summary').value = currentPerson.summary || '';
}

let peopleList = [];
let currentPerson = null;
let currentPersonId = null;

async function fetchAllPeople() {
  const data = await fetchGraphQL(`
    query {
      people { id fullName }
    }
  `);
  return data?.people || [];
}

function populateUserSelector(people) {
  const selector = document.getElementById('userSelector');
  if (!selector) return;
  selector.innerHTML = people.map(
    p => `<option value="${p.id}">${p.fullName}</option>`
  ).join('');
  selector.addEventListener('change', function() {
    loadPersonCV(this.value);
  });
}

async function loadPersonCV(personId) {
  updateDebugStatus('Loading selected user CV...');
  const data = await fetchGraphQL(`
    query ($id: ID!) {
      person(id: $id) {
        id
        fullName
        title
        email
        phone
        location
        summary
        photoUrl
        socialLinks { platform url }
        skills { name level }
        experiences { company role startDate endDate description }
        education { school degree field startYear endYear }
      }
    }
  `, { id: personId });
  const person = data?.person;
  if (!person) {
    updateDebugStatus('No person data found!');
    return;
  }
  currentPerson = person;
  currentPersonId = person.id;
  updateDisplay();
  updateDebugStatus('CV loaded successfully');
}

// Override load() to support multi-user
async function load() {
  updateDebugStatus('Loading people list...');
  peopleList = await fetchAllPeople();
  if (peopleList.length === 0) {
    updateDebugStatus('No users found!');
    return;
  }
  populateUserSelector(peopleList);
  // Load the first user by default
  loadPersonCV(peopleList[0].id);
}

// Update updatePerson to use currentPersonId
async function updatePerson(formData) {
  updateDebugStatus('Updating person...');
  if (!currentPersonId) {
    updateDebugStatus('Error: No person ID found');
    alert('Error: No person data loaded. Please refresh the page.');
    return;
  }
  const mutation = `
    mutation UpdatePerson($id: ID!, $input: PersonInput!) {
      updatePerson(id: $id, input: $input) {
        success
        errors
        person {
          id
          fullName
          title
          email
          phone
          location
          summary
          photoUrl
        }
      }
    }
  `;
  const variables = {
    id: currentPersonId,
    input: {
      fullName: formData.get('full_name'),
      title: formData.get('title'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      location: formData.get('location'),
      summary: formData.get('summary'),
      photoUrl: formData.get('photo_url')
    }
  };
  try {
    const result = await fetchGraphQL(mutation, variables);
    if (result.updatePerson.success) {
      currentPerson = { ...currentPerson, ...result.updatePerson.person };
      updateDisplay();
      closeModal();
      updateDebugStatus('CV updated successfully!');
      alert('CV updated successfully!');
    } else {
      updateDebugStatus('Error updating CV: ' + result.updatePerson.errors.join(', '));
      alert('Error updating CV: ' + result.updatePerson.errors.join(', '));
    }
  } catch (error) {
    updateDebugStatus('Error updating CV: ' + error.message);
    alert('Error updating CV. Please try again.');
  }
}

function updateDisplay() {
  if (!currentPerson) return;

  const avatar = document.getElementById('avatar');
  if (avatar) {
    avatar.src = currentPerson.photoUrl || '/static/images/avatar.svg';
  }

  text(document.getElementById('full_name'), currentPerson.fullName);
  text(document.getElementById('title'), currentPerson.title);
  text(document.getElementById('email'), currentPerson.email);
  text(document.getElementById('phone'), currentPerson.phone);
  text(document.getElementById('location'), currentPerson.location);
  text(document.getElementById('summary'), currentPerson.summary);

  const social = document.getElementById('social');
  social.innerHTML = (currentPerson.socialLinks || []).map(s => `<li><a href="${s.url}" target="_blank" rel="noreferrer">${s.platform}</a></li>`).join('');

  const skills = document.getElementById('skills');
  skills.innerHTML = (currentPerson.skills || []).map(s => `<li>${s.name}</li>`).join('');

  const exp = document.getElementById('experience');
  exp.innerHTML = (currentPerson.experiences || []).map(e => `
    <div class="card">
      <h3>${e.role} — ${e.company}</h3>
      <div class="meta">${formatDateRange(e.startDate, e.endDate)}</div>
      <p>${e.description || ''}</p>
    </div>
  `).join('');

  const edu = document.getElementById('education');
  edu.innerHTML = (currentPerson.education || []).map(ed => `
    <div class="card">
      <h3>${ed.degree} — ${ed.school}</h3>
      <div class="meta">${ed.field || ''} • ${ed.startYear} — ${ed.endYear || 'Present'}</div>
    </div>
  `).join('');
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Edit button
  const editBtn = document.getElementById('editBtn');
  if (editBtn) {
    editBtn.addEventListener('click', openModal);
  }

  // Close modal
  const closeBtn = document.querySelector('.close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
      closeModal();
    }
  });

  // Form submission
  const editForm = document.getElementById('editForm');
  if (editForm) {
    console.log('Edit form found, adding submit listener');
    editForm.addEventListener('submit', function(e) {
      e.preventDefault();
      console.log('Form submitted!');
      const formData = new FormData(editForm);
      console.log('Form data:', Object.fromEntries(formData));
      updatePerson(formData);
    });
  } else {
    console.error('Edit form not found!');
  }

  // Cancel button
  const cancelBtn = document.querySelector('.cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModal);
  }

  // Photo upload
  const uploadBtn = document.getElementById('uploadBtn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', uploadPhoto);
  }
});

async function uploadPhoto() {
  const fileInput = document.getElementById('photo_upload');
  const file = fileInput.files[0];
  
  if (!file) {
    alert('Please select a photo to upload');
    return;
  }

  const formData = new FormData();
  formData.append('photo', file);

  try {
    const response = await fetch('/upload-photo/', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (result.success) {
      // Update the photo URL field with the uploaded photo URL
      document.getElementById('edit_photo_url').value = result.photo_url;
      alert('Photo uploaded successfully!');
    } else {
      alert('Error uploading photo: ' + result.error);
    }
  } catch (error) {
    console.error('Error uploading photo:', error);
    alert('Error uploading photo. Please try again.');
  }
}

load();
