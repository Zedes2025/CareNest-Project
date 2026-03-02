1. Set up the folder structure 
You are expected to create and organize your code into the following directories. This separation of concerns is a key principle of building maintainable applications.

src/controllers: Contains the request handlers (controller functions) that implement the logic for each API endpoint.
src/models: Defines the Mongoose schemas for your database collections (User, RefreshToken).
src/middlewares: Holds custom middleware functions, such as for error handling, 404 errors, and request validation.
src/routes: Defines the API routes and maps them to the corresponding controller functions.
src/schemas: Contains Zod schemas for validating the request bodies of incoming requests.
src/utils: Includes utility functions, such as those for creating and managing JSON Web Tokens (JWTs).
src/config: For managing configuration, especially environment variables.
src/app.ts
src/db.ts

2. Setup the db connection with db.ts file and .env.development.local file

3. Run commands listed below, one by one
npm init -y
npm install -D typescript @types/node

4. Change the package.json to the below code
{
  "name": "my-ts-app",
  "version": "1.0.0",
  "main": "app.ts",
  "type": "module",
  "imports": {
    "#controllers": {
      "development": "./src/controllers/index.ts",
      "default": "./dist/controllers/index.js"
    },
    "#middlewares": {
      "development": "./src/middlewares/index.ts",
      "default": "./dist/middlewares/index.js"
    },
    "#config": {
      "development": "./src/config/index.ts",
      "default": "./dist/config/index.js"
    },
    "#models": {
      "development": "./src/models/index.ts",
      "default": "./dist/models/index.js"
    },
    "#routes": {
      "development": "./src/routes/index.ts",
      "default": "./dist/routes/index.js"
    },
      "#db": {
      "development": "./src/db.ts",
      "default": "./dist/db.js"
    },
    "#schemas": {
      "development": "./src/schemas/index.ts",
      "default": "./dist/schemas/index.js"
    },
    "#utils": {
      "development": "./src/utils/index.ts",
      "default": "./dist/utils/index.js"
    }
  },
  "scripts": {
    "dev": "node --env-file=.env.development.local --watch --conditions development src/app.ts",
    "prebuild": "rm -rf dist",
    "build": "tsc",
    "prestart": "npm run build",
    "start": "node dist/app.js"
  },
  "devDependencies": {
    "@types/node": "^24.0.3",
    "typescript": "^5.8.3"
  }
}

5. Run the command-npx tsc --init

6. Change the ts.config.json to the below code:
{
  "compilerOptions": {
    /* Base Options: */
    "esModuleInterop": true, // Enables default imports from CommonJS modules
    "lib": ["ESNext"], // Includes modern ES features in the type system
    "target": "ESNext", // Sets the JavaScript version output
    "skipLibCheck": true, // Skips type checking of declaration files (*.d.ts)
    "allowJs": true, // Allows JavaScript files in the project
    "resolveJsonModule": true, // Allows importing JSON modules
    "moduleDetection": "force", // Treats all files as modules regardless of import/export
    "isolatedModules": true, // Ensures each file can be transpiled independently
    "verbatimModuleSyntax": true, // Keeps import/export syntax as-is for Node.js
    /* Strictness */
    "strict": true, // Enables all strict type-checking options
    "noUncheckedIndexedAccess": true, // Adds 'undefined' to object access via index if type not declared
    "noImplicitOverride": true, // Requires 'override' keyword when overriding methods
    /* Node Options*/
    "allowImportingTsExtensions": true, // Allows importing files with .ts extensions
    "rewriteRelativeImportExtensions": true, // Rewrites relative imports with correct extensions
    "module": "preserve", // Preserves ES module syntax (important for native ESM)
    "noEmit": false, // Enables output generation
    "outDir": "dist", // Output directory for compiled JavaScript
    /* Paths */
    "baseUrl": "./src", // Base path for module resolution
    "paths": {
      "#*": ["*"] // Defines internal path aliases with '#' to avoid conflict with '@'
    }
  },
  "include": ["src"] // Files to include in compilation
}

7. If you have .gitignore file in Rootfolder, it will ignore ur .env file in subfolders too. (not needed to have each in subfolder, but if you dont have it in Root folder,then create .gitignore and add 
"node_modules/
dist/
.env*" )

8. Now run the below codes-one by one,
npm i
npm install express cors
npm i --save-dev @types/cors
npm i --save-dev @types/express
npm i mongoose zod jsonwebtoken bcrypt
npm i --save-dev @types/bcrypt
npm i --save-dev @types/jsonwebtoken
