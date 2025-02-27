#!/bin/bash

# Verificar que se hayan proporcionado los parámetros
if [ $# -ne 2 ]; then
    echo "Uso: $0 <ruta_a_carpeta_con_archivos> <contador_inicial>"
    exit 1
fi

# Obtener parámetros
carpeta="$1"
contador_inicial="$2"
cadena="producto"

# Verificar que la carpeta existe
if [ ! -d "$carpeta" ]; then
    echo "La carpeta no existe: $carpeta"
    exit 1
fi

# Cambiar al directorio donde están los archivos
cd "$carpeta" || exit

# Iterar sobre los archivos en la carpeta actual
contador=$contador_inicial
for archivo in *; do
    if [ -f "$archivo" ]; then
        # Obtener nombre del archivo y extensión
        nombre=$(basename "$archivo")
        extension="${nombre##*.}"
        
	# Nuevo nombre con contador al final de la cadena
        nuevo_nombre="${cadena}_${contador}.${extension}"

        # Renombrar archivo
        mv "$archivo" "$nuevo_nombre"

        # Incrementar contador
        ((contador++))
    fi
done

echo "Archivos renombrados correctamente en la carpeta: $carpeta."
