# 1. Use an official Python base image
FROM python:3.10

# 2. Accept UID and GID as build arguments
ARG UID=1000
ARG GID=1000

# 3. Create a user inside the container matching host UID/GID
RUN groupadd -g $GID appgroup && \
    useradd -m -u $UID -g $GID appuser

# 4. Set working directory
WORKDIR /app

# 5. Copy dependency files first
COPY requirements.txt ./

# 6. Install dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# 7. Copy the rest of the project
COPY . .

# 8. Change ownership of the app directory
RUN chown -R appuser:appgroup /app

# 9. Switch to the created user
USER appuser

# 10. Expose port 8000
EXPOSE 8000

# 11. Run Django server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
