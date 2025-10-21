FROM rocker/r-ver:4.3.1

# Instala dependencias del sistema
RUN apt-get update && apt-get install -y default-libmysqlclient-dev

# Instala paquetes de R
RUN R -e "install.packages(c('plumber', 'RMariaDB'))"

# Copia tus scripts
COPY . /app
WORKDIR /app

# Expone el puerto 8000
EXPOSE 8000

# Ejecuta el API
CMD ["R", "-e", "pr <- plumber::plumb('api_plumber.R'); pr$run(host='0.0.0.0', port=8000)"]
