#!/bin/sh

HOST="$1"
shift
CMD="$@"

echo "Esperando a que $HOST esté disponible..."

while ! nc -z ${HOST%:*} ${HOST#*:}; do
  echo "Esperando..."
  sleep 1
done

echo "$HOST está disponible. Ejecutando: $CMD"
exec $CMD
