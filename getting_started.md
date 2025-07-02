# Getting Started with ALeA

This guide walks you through setting up and running the **ALeA** project, which includes:
- **alea-frontend** (Next.js frontend)

## Prerequisites  
Ensure you have the following installed on your system before proceeding:
- **Node.js** (Recommended: `v18+`) – [Download](https://nodejs.org/)
- **npm** (Recommended: `v9+`) – Comes with Node.js
- **Git** – [Download](https://git-scm.com/)
- **MySQL** & **MySQL Workbench** – [Download](https://dev.mysql.com/downloads/)

```sh
npm install -g nx
```

## Installation  

1. **Clone the Repository**  
   ```sh
   git clone https://github.com/slatex/ALeA.git
   cd ALeA
   ```

2. **Install Dependencies**  
   ```sh
   npm install
   ```

## Database Setup

1. **Check for SQL Setup Files**
   - Navigate to the project folder and locate the `comments_database_setup` directory.
   - Inside, you will find SQL scripts for setting up the database.

2. **Run SQL Scripts**
   - Open MySQL Workbench.
   - Execute the SQL queries from the `comments_database_setup` folder to create the necessary database and tables.

## Running the Applications  

### alea-frontend (Next.js)  

#### Local Development  
```sh
npm run start alea-frontend
```
- Runs on `http://localhost:4200`  



   
# Access Control List (ACL) Setup

This guide provides step-by-step instructions to create and configure an Access Control List (ACL) in the system.

## Step 1: Create a New ACL

1. Go to the `/acl` endpoint in the application.
2. Create a new ACL with the following details:
   - **ACL ID**: `sys-admin`
   - **Description**: `write-dexription`
   - **Add Member ID**: Specify the member ID, e.g., `fake_joy`
   - **Add Member ACL**: Leave empty if no additional ACLs are to be added.
   - **Updater ACL**: Set this to `sys-admin`.

## Step 2: Insert into `ResourceAccess`

Run the following SQL query to add resource access control:

   ```INSERT INTO ResourceAccess (resourceId, actionId, aclId) VALUES ('/**', 'ACCESS_CONTROL', 'sys-admin');```

## Step 3: Assign Resource-Action Permissions

1. Navigate to the **exp** page in the application.
2. Locate and click on the **system-administrator** button.
3. Follow the prompts to create a resource-action assignment by specifying the desired resources and actions that the `sys-admin` role should control.
4. Save the changes.

  
