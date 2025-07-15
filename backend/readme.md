<!-- stepsss:

1: create package.json with "node-init -y", 
2: download dev dependencies ie: nodemon
3: write run scripts:
"dev": "nodemon -r dotenv/config --experimental-json-modules src/index.js"
4: download dependencies:

    "bcrypt": "^6.0.0",
    "cloudinary": "^2.6.1",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^16.5.0",
    "express": "^5.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.15.0",
    "mongoose-aggregate-paginate-v2": "^1.1.4",
    "multer": "^2.0.0"

5: make src folder, and add .gitignore(optional if publishing to git)
now make these folders:(inside src)

i: controllers
ii: db
iii: middlewares
iv: models
v: routes
vi: utils

now make these files also:

app.js -> for express server
constants.js -> for storing constants
index.js -> here connectdb is called 

6: create a public folder and make a temp file if you plan to use multer

7: now inside db folder create connectDB function

8: setup and export server from app.js

9: inside index.js we need to do call connectdb function and configure dotenv

10: create utils->model then controllers,middlewares,routes accordingly



 -->


<!-- 


| Location       | Example                 | When it’s used                                 |
| -------------- | ----------------------- | ---------------------------------------------- |
| `req.params`   | `/api/user/:id`         | When the ID is passed in the **URL path**      |
| `req.user._id` | Authenticated user      | When the ID comes from the **logged-in token** |
| `req.body`     | Body JSON               | When data is sent in **POST/PATCH** requests   |
| `req.query`    | `/api/users?role=admin` | For filtering/searching via query strings      |


 -->