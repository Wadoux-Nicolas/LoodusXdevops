## Requirements

- Docker
- Docker Compose

## Usage

### Docker Compose Services Startup

```bash
docker-compose up --detach
```

Go on [http://localhost:8000](http://localhost:8000) to see the magic (install and start the dev server are done when building the container)

### Node Packages Installation (already done when building container)

```bash
docker-compose exec node npm install
```

### Development Server Startup (already done when building container)

```bash
docker-compose exec node npm start
```


### Create a new feature or component

```bash
node bin/generator feature|component|f|c ComponentName
```

### Get help about the generator

```bash
node bin/generator -help
```

### Docker Compose Services Shutdown

```bash
docker-compose down --remove-orphans --volumes --timeout 0
```

## How to build production

When merging in master, a new version is automatically built and deployed on [https://loodus.nicolas-wadoux.fr](https://loodus.nicolas-wadoux.fr)
(Check the github action to know when it's done)


## Figma

https://www.figma.com/file/3ZrsP9NTukjtrBUzhBkO9P/Maquette?node-id=0%3A1&t=ET9lkuueq4jvLNTX-1
