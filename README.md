\# Course Registration System – Frontend Client



\## Project Overview



A web-based client for the Ofek Course Registration System.



The application allows users to browse courses, register for courses, manage their registrations and access administrative features according to their permissions.



\## Technologies



\- HTML5

\- CSS3

\- JavaScript

\- Fetch API

\- JSON

\- JWT Authentication

\- Session Storage

\- Git and GitHub

\- Render Static Sites



\## Main Features



\### Visitors



\- Browse the course catalog.

\- View course details.

\- Search and filter courses.

\- Create a user account.

\- Log in to the system.



\### Registered Users



\- Register for available courses.

\- View active course registrations.

\- Cancel registrations before a course begins.

\- View course availability.

\- Receive feedback when registration is rejected.



\### Administrators



\- Create new courses.

\- Edit existing courses.

\- Delete courses according to business rules.

\- Manage course capacity.



\## API Integration



The frontend communicates with the ASP.NET Core Web API using HTTP requests and JSON responses.



The application uses the Fetch API to communicate with the backend.



JWT tokens are stored in Session Storage and included in authenticated requests.



The client handles API responses, including HTTP 409 Conflict responses related to registration and concurrency.



\## Project Structure



\- index.html – Main page and course catalog.

\- auth.html – Login and account registration.

\- course-details.html – Course details and registration.

\- my-courses.html – User course registrations.

\- admin.html – Administration panel.

\- js/ – JavaScript files and application logic.

\- js/config.js – Central API configuration.



\## Environment Configuration



The API base URL is configured centrally in config.js.



The application automatically selects the appropriate API address according to its environment.



Local API:



https://localhost:7069/api



Production API:



https://courseregistration-api.onrender.com/api



This approach avoids duplicating API addresses throughout the application.



\## Local Setup



1\. Clone the frontend repository.

2\. Clone and configure the backend repository.

3\. Open the projects in Visual Studio.

4\. Configure the API and Client as multiple startup projects.

5\. Run both projects.

6\. Open the client in a web browser.



\## Cloud Deployment



The frontend is deployed as a Render Static Site.



Deployment configuration:



\- Branch: main

\- Publish directory: wwwroot

\- No build process required.



The backend is deployed separately on Render.



CORS is configured on the backend to allow communication with the deployed frontend.



Local functionality has been tested. Full cloud functionality verification is pending network access approval.



\## Project Links



Frontend repository:



https://github.com/chayarivka/CourseRegistration-Client



Backend repository:



https://github.com/chayarivka/CourseRegistration-API



Live website:



https://courseregistration-client.onrender.com



Backend API:



https://courseregistration-api.onrender.com



Swagger documentation:



https://courseregistration-api.onrender.com/swagger/index.html



