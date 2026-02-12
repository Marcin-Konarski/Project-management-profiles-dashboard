FROM python:3.14-slim

RUN apt-get update

# Create a non-root user so that it runs with least priveleges
RUN groupadd app && useradd -m -g app app

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

USER app

EXPOSE 8080

CMD ["fastapi", "dev", "main.py", "--host", "0.0.0.0", "--port", "8080", "--app", "app"]