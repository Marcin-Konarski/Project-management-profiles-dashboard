# Project Management Dashboard

A full-stack project management platform where users can create projects, collaborate with team members, and manage documents with secure cloud storage.


<img width="1271" height="706" alt="{D4BFFAF2-298C-47E1-9DA4-D82974D0A8DE}" src="https://github.com/user-attachments/assets/37c6a2e4-5494-40fd-9e24-959b3b64c473" />


## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS, Radix UI
- Backend: FastAPI, SQLModel, SQLAlchemy, Pydantic
- Database: PostgreSQL
- Storage: AWS S3 (document storage with presigned URLs)
- Async Processing: AWS Lambda (post-upload metadata processing)
- Infrastructure: Terraform, AWS ECS Fargate, Application Load Balancer, IAM, VPC, Security Groups, CloudWatch
- Migrations: Alembic
- DevOps/Quality: Docker, GitHub Actions, Ruff, Pytest

## Key Functionalities

- Authentication and authorization:
  - User registration and login
  - JWT-based access control
  - Protected API endpoints

- Project management:
  - Create, update, list, and delete projects
  - Project ownership model
  - Access control per project (owner/member permissions)

- Team collaboration:
  - Add and remove project members
  - Role-based member management

- Document management:
  - Create document records inside projects
  - Upload files directly to S3 via presigned POST URLs
  - Download/access files via presigned GET URLs
  - Replace file content via presigned PUT URLs
  - Update and delete document metadata

- Event-driven backend workflow:
  - S3 upload events trigger Lambda
  - Lambda reads object metadata (size/content type)
  - Lambda confirms upload to backend internal endpoint
  - Document status lifecycle (pending -> uploaded)

- Cloud-native deployment:
  - Containerized backend on ECS Fargate
  - ALB routing and HTTPS support
  - Infrastructure managed as code with Terraform


<img width="1270" height="708" alt="{069AF6D6-DFC1-4D9E-BFF4-640FE77981FC}" src="https://github.com/user-attachments/assets/bcb4b061-96a7-4822-bb1e-0fe0315be215" />



## Local Development Workflow

This project uses `ruff` for fast Python linting and formatting, along with `pre-commit` hooks to ensure code quality before pushing.

#### 1. Install Dependencies
Make sure you have installed both standard and development dependencies:
```bash
pip install -r backend/requirements.txt
pip install -r backend/requirements.dev.txt
```

#### 2. Set Up Pre-commit Hooks
To automatically run format checks exactly like the CI pipeline before every commit, install the hooks:
```bash
pre-commit install
```
Now, whenever you run `git commit`, `ruff` will automatically format and lint your staged files.

#### 3. Usage (Manual Commands)
If you want to manually run standard code quality checks:
* **Linting:**
  ```bash
  ruff check .
  ```
  *(To automatically fix safe issues: `ruff check --fix .`)*

* **Formatting:**
  ```bash
  ruff format .
  ```

* **Running Tests:**
  ```bash
  PYTHONPATH=. pytest tests/
  ```

#### Continuous Integration
A GitHub Action is configured (`.github/workflows/ci.yml`) to verify:
- Complete test suite passes.
- Code conforms strictly to `ruff`'s standards.
- Successful builds push a docker image to Docker Hub (ensure `DOCKER_HUB_PASSWORD` is configured as a GitHub Secret).
