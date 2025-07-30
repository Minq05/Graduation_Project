# Graduation Project - Client

This is the client-side of the Graduation Project. Below is an overview of the installed libraries and the project directory structure.

## Installed Libraries

### Frontend Libraries
- **React Router**: For handling routing in the application.
- **Axios**: For making HTTP requests to the backend.
- **Redux**: For state management across the application.
- **Material-UI**: For pre-designed React components and styling.
- **React-hook-form**: For building and managing forms.
- **Joi**: For form validation schema.
- **Framer-motion**: For animation


## Project Directory Structure

```
Front-end/
├── public/               # Static files like index.html, images, etc.
├── src/                  # Source code for the client-side application
│   ├── apis/             # Write apis here
│   ├── components/       # Reusable React components
│   ├── pages/            # Page-level components
│   ├── redux/            # Redux store, actions, and reducers
│   ├── services/         # API service files (e.g., Axios configurations)
│   ├── utils/            # Utility functions and helpers
│   ├── styles/           # Global and component-specific styles
│   ├── App.js            # Main application component
│   ├── index.js          # Entry point of the React application
├── package.json          # Project dependencies and scripts
├── README.md             # Project documentation (this file)
```

## How to Run the Project

1. Clone project:
   ```bash
   git clone https://github.com/thenam2kx/Graduation_Project-admin.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open the application in your browser at `http://localhost:5173`.

## 📖 Kéo branch từ github về máy
### 🚀 1. Kiểm tra các branch đang có trên github
```
  - git fetch
  - git branch -r
```

### 🚀 2. Kéo branch cụ thể về máy (thay thế branch-name bằng tên branch)
```
  - git checkout -b branch-name origin/branch-name
```

## Contribution Guidelines

- Follow the coding standards defined in `.eslintrc` and `.prettierrc`.
- Ensure all new features are tested before merging.
- Use meaningful commit messages.

## License

This project is licensed under the MIT License.
