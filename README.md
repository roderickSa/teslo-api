<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Teslo API

### General info

<strong>Project is created with</strong>:

<ol>
  <li>nestjs</li>
  <li>postgres</li>
  <li>cloudinary(images)</li>
</ol>

### 1. Clonar proyecto

### 2. `yarn install`

### 3. Clonar el archivo `.env.template` y renombrarlo a `.env`

### 4. Cambiar las variables de entorno

<strong>suficiente con estas</strong>:

```env
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

## 5 Levantar la base de datos

```
docker-compose up -d
```

### 6 Levantar: `yarn start:dev`

### 7 Ejecutar SEED

```
http://localhost:3000/api/seed
```
