# Raspberry Pi 4B Deployment Guide

This guide covers the simplest way to deploy the QuoteBank application onto your Raspberry Pi 4B using Docker.

## Prerequisites

1.  **A Raspberry Pi 4B** with a fresh OS installed (e.g., Raspberry Pi OS 64-bit or Ubuntu Server 64-bit).
2.  **SSH Access** to your Raspberry Pi.
3.  **Docker & Docker Compose** installed on the Raspberry Pi.

> **Note:** If you haven't installed Docker yet on your Raspberry Pi, you can do so by running the following commands over SSH:
> ```bash
> curl -fsSL https://get.docker.com -o get-docker.sh
> sudo sh get-docker.sh
> sudo usermod -aG docker $USER
> ```
> *(Remember to log out and log back in for the group changes to take effect.)*

---

## 1. Transfer the Code to the Raspberry Pi

The easiest way to move your project to the Raspberry Pi is via `rsync` or `scp` from your Mac.

Open a terminal on your Mac and run (replace `pi@raspberrypi.local` with your actual Pi's username and IP/hostname):

```bash
# Navigate to the project directory
cd /Users/ot/Projects/quotebank

# Copy the files to the Raspberry Pi
rsync -avz --exclude='venv' --exclude='__pycache__' --exclude='.git' ./ ot@otberry.local:~/quotebank
```

---

## 2. Connect to the Raspberry Pi

SSH into your Raspberry Pi and navigate to the newly created folder:

```bash
ssh pi@raspberrypi.local
cd ~/quotebank
```

---

## 3. Prepare the Environment

Before starting the containers, you **must** manually create the database file and the uploads directory to prevent Docker from misconfiguring the file volume bindings:

```bash
# Create the SQLite database file
touch quotebank.db

# Create the uploads directory for images
mkdir -p backend/uploads

# Ensure the container has permission to read/write to them
chmod 666 quotebank.db
chmod -R 777 backend/uploads
```

> **IMPORTANT:** If you do not run `touch quotebank.db` before `docker-compose up`, Docker will mistakenly create a **directory** named `quotebank.db`, which will cause the application to crash.

---

## 4. Build and Start the Application

Now, simply instruct Docker Compose to build and start your application in detached mode:

```bash
docker-compose up -d --build
```

> **Tip:** The build process might take a few minutes on the Raspberry Pi as it installs the Python packages. Once it's done, it will map port `8000` to your Pi's local IP address.

---

## 5. Verify the Deployment

Check that the container is running smoothly:

```bash
docker-compose logs -f
```

You can now access your application from any device on your local network by going to:
`http://raspberrypi.local:8000`
*(Or replace `raspberrypi.local` with your Pi's actual IP address, e.g., `http://192.168.1.50:8000`)*

---

## Managing the App

- **To stop the app:** `docker-compose down`
- **To restart the app:** `docker-compose restart`
- **To view logs:** `docker-compose logs --tail 100 -f`
