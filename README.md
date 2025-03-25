# Food Menu System

## Overview
This is a Node.js application with MongoDB for managing a food menu system with user roles (Admin and User). The system allows users to browse the menu and manage their profiles, while admins can add, edit, and organize the menu, as well as manage user roles.

## Features
### User Roles
- **Admin**
  - Login with email and password
  - Add/Edit/Delete food categories and menu items
  - View the list of registered users
  - Promote users to admin
- **User**
  - Sign up with email and password
  - Login with email and password
  - Edit their profile (name, contact details, etc.)
  - View the food menu

### Food Menu Structure
- The menu consists of **categories** and **food items**.
- Categories support unlimited levels (nested hierarchy).
- Example structure:
  - Food > Chinese > Noodles > Spicy
  - Food > Indian > Curry > Paneer

## Technology Stack
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **ORM**: Mongoose
- **Authentication**: JWT (JSON Web Token)
- **Validation**:  Express Validator
- **Environment Management**: dotenv

## Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/kelbin-jacob/Riolabs-task.git
   cd food-menu-system
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Configure environment variables:
   - Create a `.env` file in the root directory and add the following:
     ```env
     PORT=8080
     MONGO_URI=mongodb://127.0.0.1:27017/RioLabs
   
     ACCESS_TOKEN_SECRET=your_jwt_secret   <!-- 2baf1c4e9d3f8c6e7a1b0f5d8e3a2c9f4e6d7a8b1c0d9e2f3a4b5c6d7e8f9a0b -->
     REFRESH_TOKEN_SECRET=your_jwt_secret       <!-- 8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a -->

     ADMIN_PASSWORD=adminPassword

     ADMIN_EMAIL=admin@gmail.com
     
     ```
4. Start the server:
   ```sh
npm run start
   ```

## API Endpoints

### User API'S
- **POST** `/api/user/userRegister` - User Register
- **POST** `/api/user/login` - User Login
- **PUT** `/api/user/updateProfile` - Update user profile
- **GET** `/api/user/getProduct/:id` - Get product by category
- **GET** `/api/user/getProductCategory` - Get all food category list

### Admin API'S
- **POST** `/api/admin/login` - Admin Login
- **POST** `/api/admin/productCategory` - Create food category
- **GET** `/api/admin/getProductCategory` - Get all food category list
- **PUT** `/api/admin//updateProductCategory/:id` - Update food category
- **PUT** `/api/admin/deleteProductCategory/:id` - Soft delete food category
- **POST** `/api/admin/productAdd` - Add Food product
- **GET** `/api/admin/getAllProduct` - Get all food products
- **GET** `/api/admin/getProduct/:id` - Get all food products from category
- **GET** `/api/admin/getProductByID/:id` - Get food product details
- **PUT** `/api/admin/productUpdate/:id` - Update food product details
- **GET** `/api/admin/getUsers` - Get all users
- **PUT** `/api/admin/promoteUser/:id` - Promote user to admin
-

## License

MIT License

Copyright (c) 2025 kelbin-jacob

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Author
Kelbin Jacob

