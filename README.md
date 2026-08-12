# TCG CardHeaven — Grupo 3

e-commerce de cartas TCG

---

## Requisitos

| Herramienta                           |
|---------------------------------------|
| **Java JDK 21**                       |
| **Docker**                            |
| **Git**                               |
| **Postman/Curl/Insomia**              |
| **Workbench o gestor de preferencia** |


## Instalación

### 1) Clonar

```bash
git clone https://github.com/rockhex/TPO--TCG-CardHeaven-Grupo3
```

### 2) Inicializar la base de datos con docker

```bash
docker compose up -d
```

- Nombre: `tcgtrader-db`
- Schema: `tcgtrader`
- Usuario: `root`
- Contraseña: `root`
- Puerto: `3306`

Verificar que el contenedor esté corriendo:

```bash
docker ps
```

Para detener la base:

```bash
docker compose down
```

Para borrar los datos:

```bash
docker compose down -v
```

### 3) Ejecutar el proyecto

**En CMD / PowerShell:**

```bash
mvnw.cmd spring-boot:run
```

**Git Bash:**

```bash
./mvnw spring-boot:run
```

**Desde IntelliJ IDEA:**

1. Asegurarse de que MySQL esté levantado (`docker compose up -d`).
2. Ir a `src/main/java/com/tcgtrader/TcgTraderApplication.java`.
3. Hacer click en la flecha verde al lado de `main` `Run 'TcgTraderApplication.main()'`.


La aplicación se levanta en el puerto **8080**.

Si todo salió bien, vas a ver algo como:

```
Started TcgTraderApplication in X.XXX seconds
```

---

## Verificar que funciona

### Swagger UI (documentación interactiva de la API)

Abrí en el navegador:

```
http://localhost:8080/swagger-ui.html
```

### Endpoints de ejemplo

- **Registro de usuario** (público):
  ```
  POST http://localhost:8080/api/auth/register
  ```
- **Login** (público) — devuelve un JWT:
  ```
  POST http://localhost:8080/api/auth/login
  ```
- **Listado de cartas** (público):
  ```
  GET http://localhost:8080/api/cards
  ```

Los endpoints con rol incluir el header:

```
Authorization: Bearer <token JWT>
```

---

## Ejecutar el script de tests de endpoints

El repo incluye `test_endpoints.sh`

**Requisitos:** la app corriendo en el puerto 8080 y MySQL arriba. Para resultados reproducibles conviene arrancar con una base vacía (`docker compose down -v && docker compose up -d`) antes de levantar la app.

**Desde Git Bash**

```bash
./test_endpoints.sh
```

---

## Colección de Postman

El repo incluye `postman_collection.json` con todos los endpoints agrupados por carpeta, ya tiene algunas variables default cargadas