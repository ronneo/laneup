# LaneUP

This is a hobby project for a queue ticketing system. It is currently work in progress.

## What does this do?
It allows for queue number to be dispense and be tracked via the users or the admins. Features as follows:
- All for multiple branches and groups, with each group having their own queue
- Supports different interfaces for different users (as mentioned below)
- Run on web interfaces and websockets

## Usage
**Kiosk**   
A frontend panel that can dispense queue number (on a kiosk), with a QR code to allow a user to track their queue status on their mobile device  
<img src="docs/images/phone-entry.png?raw=true" width="300" />
<img src="docs/images/status.png?raw=true" width="300" />

**Display Panel**   
A display that shows all the different groups and their current respective queues  
<img src="docs/images/display-panel.png?raw=true" width="100%" />

**Manager**   
Managers can use a control panel to call up or delete queue numbers
<img src="docs/images/manager.png?raw=true" width="100%" />

**Admin**   
Admins to update groups/branches 

## Installation By docker compose
**Requirements**
- Node and npm ([Download](https://nodejs.org/en/download))
- Docker ([Download](https://www.docker.com/))

**Steps**
1. Download this repositary
2. Run `./build.sh`
3. Go to deployments folder and run `docker compose up`
4. Log in to /admin and update the default password

## Backend Set up
The project consists of 3 separate backend components (services)
- Web Front-end server (built in Sveltekit)
- API + Web Socket server (currently on NodeJS)
- Database on Postgresql

## Running Tests
**Requirements**
- Unit tests have been added for the API server
- Unit tests requires a dummy Postgres database connection
- Tests utilises `.env.testing` for database connection
- Run `npm test` under `/api` folder