# CV Maker

A modern, responsive CV/Resume builder with a beautiful dark theme and easy editing capabilities.

## Features

- ✨ **Beautiful Dark Theme** - Modern, professional design
- 📝 **Easy CV Editing** - Click "Edit CV" to modify your information
- 📸 **Photo Upload** - Upload your personal photo directly
- 🔗 **Social Links** - Add your professional social media profiles
- 🎯 **Skills & Experience** - Organize your professional background
- 📱 **Responsive Design** - Works perfectly on all devices
- 🚀 **GraphQL API** - Modern backend with GraphQL support

## Quick Start

### 1. Setup the Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # Create admin user
python manage.py runserver
```

### 2. Seed Sample Data

```bash
cd backend
python manage.py seed_cv
```

### 3. Access Your CV

- **View CV**: http://localhost:8000/
- **Admin Panel**: http://localhost:8000/admin/
- **GraphQL API**: http://localhost:8000/graphql/

## How to Use

### Adding a Favicon

The favicon is already configured and located at `frontend/static/images/favicon.png`. You can replace this file with your own favicon.

### Adding a Personal Photo

1. **Click "Edit CV"** button on your CV
2. **Option 1**: Enter a photo URL in the "Photo URL" field
3. **Option 2**: Use the file upload feature:
   - Click "Choose File" and select your photo
   - Click "Upload Photo" to upload it to the server
   - The photo URL will automatically be filled in

### Editing Your CV

1. **Click "Edit CV"** button on your CV
2. **Fill in your information**:
   - Full Name (required)
   - Professional Title
   - Email Address
   - Phone Number
   - Location
   - Professional Summary
3. **Click "Save Changes"** to update your CV

### Managing CV Data

You can also manage your CV data through the Django admin panel:

1. Go to http://localhost:8000/admin/
2. Login with your superuser credentials
3. Edit the "Person" record to update your basic information
4. Add/edit Skills, Experience, Education, and Social Links

## File Structure

```
CVMaker/
├── backend/                 # Django backend
│   ├── cv/                 # CV app
│   │   ├── models.py      # Database models
│   │   ├── admin.py       # Admin interface
│   │   └── views.py       # Views and file uploads
│   ├── cvmaker/           # Django project settings
│   └── manage.py          # Django management
├── frontend/               # Frontend assets
│   ├── static/            # CSS, JS, images
│   └── index.html         # Main HTML template
└── images/                 # Project images
```

## Customization

### Changing Colors

Edit `frontend/static/style.css` to customize the color scheme:

```css
:root {
  --primary-color: #5865f2;
  --background-color: #0b1020;
  --card-background: #11162d;
}
```

### Adding New Sections

1. Update the Django models in `backend/cv/models.py`
2. Add GraphQL types in `backend/cvmaker/schema.py`
3. Update the frontend HTML and JavaScript
4. Add corresponding CSS styling

## Technologies Used

- **Backend**: Django, GraphQL (Graphene), SQLite
- **Frontend**: Vanilla JavaScript, CSS3, HTML5
- **Styling**: Custom CSS with modern design principles
- **File Uploads**: Django file storage system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.