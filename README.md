## Requirements

- Docker
- Docker Compose

## Usage

### Docker Compose Services Startup

```bash
docker-compose up --detach
```

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