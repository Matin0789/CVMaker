async function fetchGraphQL(query, variables) {
  const res = await fetch('/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  const json = await res.json();
  if (json.errors) { console.error(json.errors); }
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
  
  document.getElementById('edit_full_name').value = currentPerson.full_name || '';
  document.getElementById('edit_title').value = currentPerson.title || '';
  document.getElementById('edit_email').value = currentPerson.email || '';
  document.getElementById('edit_phone').value = currentPerson.phone || '';
  document.getElementById('edit_location').value = currentPerson.location || '';
  document.getElementById('edit_photo_url').value = currentPerson.photo_url || '';
  document.getElementById('edit_summary').value = currentPerson.summary || '';
}

async function updatePerson(formData) {
  const mutation = `
    mutation UpdatePerson($id: ID!, $input: PersonInput!) {
      updatePerson(id: $id, input: $input) {
        success
        errors
        person {
          id
          full_name
          title
          email
          phone
          location
          summary
          photo_url
        }
      }
    }
  `;

  const variables = {
    id: currentPerson.id,
    input: {
      full_name: formData.get('full_name'),
      title: formData.get('title'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      location: formData.get('location'),
      summary: formData.get('summary'),
      photo_url: formData.get('photo_url')
    }
  };

  try {
    const result = await fetchGraphQL(mutation, variables);
    if (result.updatePerson.success) {
      // Update the current person data and refresh the display
      currentPerson = { ...currentPerson, ...result.updatePerson.person };
      updateDisplay();
      closeModal();
      alert('CV updated successfully!');
    } else {
      alert('Error updating CV: ' + result.updatePerson.errors.join(', '));
    }
  } catch (error) {
    console.error('Error updating person:', error);
    alert('Error updating CV. Please try again.');
  }
}

function updateDisplay() {
  if (!currentPerson) return;

  const avatar = document.getElementById('avatar');
  if (avatar) {
    avatar.src = currentPerson.photo_url || '/static/images/avatar.svg';
  }

  text(document.getElementById('full_name'), currentPerson.full_name);
  text(document.getElementById('title'), currentPerson.title);
  text(document.getElementById('email'), currentPerson.email);
  text(document.getElementById('phone'), currentPerson.phone);
  text(document.getElementById('location'), currentPerson.location);
  text(document.getElementById('summary'), currentPerson.summary);
}

let currentPerson = null;

async function load() {
  const data = await fetchGraphQL(`
    query {
      people { id full_name title email phone location summary photo_url
        social_links { platform url }
        skills { name level }
        experiences { company role start_date end_date description }
        education { school degree field start_year end_year }
      }
    }
  `);
  const person = data?.people?.[0];
  if (!person) return;

  currentPerson = person;
  updateDisplay();

  const social = document.getElementById('social');
  social.innerHTML = person.social_links.map(s => `<li><a href="${s.url}" target="_blank" rel="noreferrer">${s.platform}</a></li>`).join('');

  const skills = document.getElementById('skills');
  skills.innerHTML = person.skills.map(s => `<li>${s.name}</li>`).join('');

  const exp = document.getElementById('experience');
  exp.innerHTML = person.experiences.map(e => `
    <div class="card">
      <h3>${e.role} — ${e.company}</h3>
      <div class="meta">${formatDateRange(e.start_date, e.end_date)}</div>
      <p>${e.description || ''}</p>
    </div>
  `).join('');

  const edu = document.getElementById('education');
  edu.innerHTML = person.education.map(ed => `
    <div class="card">
      <h3>${ed.degree} — ${ed.school}</h3>
      <div class="meta">${ed.field || ''} • ${ed.start_year} — ${ed.end_year || 'Present'}</div>
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
    editForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = new FormData(editForm);
      updatePerson(formData);
    });
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
