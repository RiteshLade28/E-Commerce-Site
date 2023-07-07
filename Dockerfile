# Use an official Python runtime as the base image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /

# Copy the requirements file to the working directory
COPY requirements.txt .

# Install the required packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code to the working directory
COPY . .

# Set the environment variable for Flask
ENV FLASK_APP=app.py

# Expose the port on which the Flask app will run
EXPOSE 5000

# Run the Flask application
CMD ["flask", "run", "--host", "0.0.0.0"]
