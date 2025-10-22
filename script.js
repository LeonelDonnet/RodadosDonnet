// Arrays para guardar los productos
let bicicletas = [];
let repuestos = [];

// Cargar los datos cuando se abre la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página cargada, iniciando carga de datos...');
    cargarBicicletas();
    cargarRepuestosCSV();
});

// Función para cargar bicicletas desde CSV
function cargarBicicletas() {
    const csvFile = './data/bicicletas.csv';
    console.log('🔍 DEBUG: Intentando cargar:', csvFile);
    
    fetch(csvFile)
        .then(response => {
            console.log('🔍 DEBUG: Respuesta recibida - Status:', response.status);
            if (!response.ok) throw new Error('Archivo no encontrado');
            return response.text();
        })
        .then(data => {
            console.log('✅ DEBUG: Datos CSV recibidos - Primeros 200 chars:', data.substring(0, 200));
            procesarBicicletas(data);
        })
        .catch(error => {
            console.error('❌ DEBUG: Error completo:', error);
            document.getElementById('resultadoBicicletas').innerHTML = 
                '<p style="color: red;">❌ Error al cargar bicicletas. Verificá la consola (F12)</p>';
        });
}

// Función para cargar repuestos desde el CSV real
function cargarRepuestosCSV() {
    const csvUrl = './repuestos.csv';
    
    console.log('🔄 Iniciando carga de repuestos desde:', csvUrl);
    
    fetch(csvUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo CSV');
            }
            return response.text();
        })
        .then(csvText => {
            console.log('✅ CSV de repuestos cargado exitosamente');
            procesarCSVRepuestos(csvText);
        })
        .catch(error => {
            console.error('Error cargando CSV:', error);
            document.getElementById('resultadoRepuestos').innerHTML = 
                `<p style="color: red;">❌ Error cargando repuestos: ${error.message}</p>
                 <p style="color: #FFD700;">Usando datos de ejemplo por ahora...</p>`;
            cargarRepuestosEjemplo();
        });
}

// Función de respaldo para repuestos
function cargarRepuestosEjemplo() {
    repuestos = [
        {
            codigo: "4065",
            descripcion: "PENETIT - 10 FUNCIONES ACEITE EN AEROSOL MULTIPROPOSITO 250CC",
            precio: "6216.92",
            categoria: "Lubricantes"
        },
        {
            codigo: "2013",
            descripcion: "MTI - ACEITE SECO LCG-3F AEROSOL X 180ML",
            precio: "16608.42",
            categoria: "Lubricantes"
        }
    ];
    
    console.log('Repuestos de ejemplo cargados:', repuestos.length);
    document.getElementById('resultadoRepuestos').innerHTML = 
        `<p class="instrucciones">🔧 ${repuestos.length} repuestos cargados (modo demo)</p>`;
}

// Función para procesar el CSV de repuestos - VERSIÓN CORREGIDA
function procesarCSVRepuestos(csvText) {
    const lineas = csvText.split('\n');
    repuestos = [];
    
    let repuestosCargados = 0;
    let lineasProcesadas = 0;

    console.log('📊 Total de líneas en CSV:', lineas.length);

    // Mostrar estructura del CSV para debug
    console.log('🔍 Primeras 10 líneas del CSV:');
    for (let i = 0; i < Math.min(10, lineas.length); i++) {
        console.log(`Línea ${i}: "${lineas[i]}"`);
    }

    // Buscar la línea donde empiezan los datos reales (después de los ;;;)
    let encontroDatos = false;
    
    for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i].trim();
        lineasProcesadas++;
        
        // Saltar líneas vacías o con solo ";"
        if (!linea || linea === ';;;' || linea.startsWith(';REPUESTOS')) {
            continue;
        }
        
        // Buscar el encabezado de columnas
        if (linea.includes('ARTICULO') && linea.includes('DESCRIPCION')) {
            console.log(`✅ Encabezado encontrado en línea ${i}`);
            encontroDatos = true;
            continue;
        }
        
        // Si encontramos el encabezado, procesar las siguientes líneas
        if (encontroDatos && linea.includes(';')) {
            const columnas = linea.split(';');
            
            // Tu CSV tiene este formato: código;descripción;costo;precio
            if (columnas.length >= 4) {
                const codigo = columnas[0] ? columnas[0].trim() : '';
                const descripcion = limpiarDescripcion(columnas[1] ? columnas[1].trim() : '');
                const precioSugerido = columnas[3] ? convertirPrecio(columnas[3].trim()) : '0';
                
                // Solo agregar si tiene código, descripción y precio válido
                if (codigo && descripcion && descripcion.length > 3 && precioSugerido !== '0') {
                    const repuesto = {
                        codigo: codigo,
                        descripcion: descripcion,
                        precio: precioSugerido,
                        categoria: determinarCategoria(descripcion),
                        costo: columnas[2] ? convertirPrecio(columnas[2].trim()) : '0'
                    };
                    
                    repuestos.push(repuesto);
                    repuestosCargados++;
                    
                    // Mostrar los primeros 5 para debug
                    if (repuestosCargados <= 5) {
                        console.log(`✅ Repuesto ${repuestosCargados}:`, repuesto);
                    }
                }
            }
        }
    }



console.log(`🎯 RESUMEN FINAL: ${repuestosCargados} repuestos cargados de ${lineasProcesadas} líneas procesadas`);
    
    if (repuestosCargados > 0) {
        document.getElementById('resultadoRepuestos').innerHTML = 
            `<p class="instrucciones">🔧 ${repuestosCargados} repuestos cargados</p>
             <p style="color: #27ae60; font-size: 0.9em; text-align: center;">
                ✅ Repuestos cargados correctamente. Buscá por código o nombre.
             </p>`;
    } else {
        document.getElementById('resultadoRepuestos').innerHTML = 
            `<p style="color: red;">❌ No se pudieron cargar repuestos del CSV. Revisá la consola.</p>`;
        // Forzar carga de ejemplo si no hay datos
        cargarRepuestosEjemplo();
    }
}

// Función para determinar categoría automáticamente
function determinarCategoria(descripcion) {
    const descLower = descripcion.toLowerCase();
    
    if (descLower.includes('asiento') || descLower.includes('sillin')) return 'Asientos';
    if (descLower.includes('cadena')) return 'Transmisión';
    if (descLower.includes('freno')) return 'Frenos';
    if (descLower.includes('cámara') || descLower.includes('camara')) return 'Cámaras';
    if (descLower.includes('cubierta') || descLower.includes('llanta') || descLower.includes('neumatico')) return 'Cubiertas';
    if (descLower.includes('manija') || descLower.includes('manubrio') || descLower.includes('manilla')) return 'Manubrios';
    if (descLower.includes('pedal')) return 'Pedales';
    if (descLower.includes('cambio') || descLower.includes('shift')) return 'Cambios';
    if (descLower.includes('aceite') || descLower.includes('grasa') || descLower.includes('lubric')) return 'Lubricantes';
    if (descLower.includes('casco')) return 'Seguridad';
    if (descLower.includes('luces') || descLower.includes('farol') || descLower.includes('luz')) return 'Iluminación';
    if (descLower.includes('candado')) return 'Seguridad';
    if (descLower.includes('inflador') || descLower.includes('bomba')) return 'Herramientas';
    if (descLower.includes('herramienta') || descLower.includes('kit') || descLower.includes('llave')) return 'Herramientas';
    if (descLower.includes('canasto') || descLower.includes('canasta') || descLower.includes('portaequipaje')) return 'Accesorios';
    if (descLower.includes('guardabarros') || descLower.includes('guardafango')) return 'Accesorios';
    
    return 'General';
}



// Función para procesar bicicletas
function procesarBicicletas(data) {
    const lineas = data.split('\n');
    bicicletas = [];
    
    let productosCargados = 0;
    
    for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i].trim();
        if (!linea || linea.startsWith(';') || !linea.includes(';')) continue;
        
        const columnas = linea.split(';');
        const primerValor = columnas[0] ? columnas[0].trim() : '';
        
        if (!isNaN(primerValor) && primerValor !== '' && columnas.length >= 4) {
            const precioPublico = columnas[3] ? convertirPrecio(columnas[3].trim()) : '0';
            const descripcion = limpiarDescripcion(columnas[1] ? columnas[1].trim() : '');
            
            const producto = {
                codigo: primerValor,
                descripcion: descripcion,
                precio: precioPublico,
                tipo: 'bicicleta'
            };
            
            if (descripcion && descripcion.length > 5) {
                bicicletas.push(producto);
                productosCargados++;
            }
        }
    }
    
    console.log('Bicicletas cargadas:', productosCargados);
    
    if (productosCargados > 0) {
        document.getElementById('resultadoBicicletas').innerHTML = 
            `<p class="instrucciones">🚴‍♂️ ${productosCargados} bicicletas cargadas. Buscá por código o nombre.</p>`;
    }
}

// Función de búsqueda general
function buscarProducto(tipo) {
    const inputId = tipo === 'bicicletas' ? 'searchBicicletas' : 'searchRepuestos';
    const resultadoId = tipo === 'bicicletas' ? 'resultadoBicicletas' : 'resultadoRepuestos';
    const lista = tipo === 'bicicletas' ? bicicletas : repuestos;
    const nombreTipo = tipo === 'bicicletas' ? 'bicicletas' : 'repuestos';
    
    const busqueda = document.getElementById(inputId).value.trim().toLowerCase();
    
    if (!busqueda) {
        document.getElementById(resultadoId).innerHTML = 
            `<p class="instrucciones">Ingresá un código o nombre para buscar ${nombreTipo}</p>`;
        return;
    }
    
    if (lista.length === 0) {
        document.getElementById(resultadoId).innerHTML = 
            `<p style="color: red;">❌ No hay ${nombreTipo} cargados.</p>`;
        return;
    }
    
    const resultados = lista.filter(producto => 
        producto.codigo.toLowerCase().includes(busqueda) ||
        producto.descripcion.toLowerCase().includes(busqueda)
    );
    
    mostrarResultados(resultados, busqueda, resultadoId, nombreTipo);
}

// Función para mostrar resultados (VERSIÓN CORREGIDA)
function mostrarResultados(resultados, busqueda, resultadoId, tipo) {
    const resultadoDiv = document.getElementById(resultadoId);
    
    if (resultados.length === 0) {
        resultadoDiv.innerHTML = `
            <p style="color: #e74c3c; text-align: center;">
                ❌ No se encontraron ${tipo} para: "<strong>${busqueda}</strong>"
            </p>
        `;
        return;
    }
    
    const emoji = tipo === 'bicicletas' ? '🚴‍♂️' : '🔧';
    let html = `<h3>${emoji} ${resultados.length} resultado(s) para: "${busqueda}"</h3>`;
    
    resultados.forEach(producto => {
        const precioFormateado = formatearPrecio(producto.precio);
        const precioNumerico = parseFloat(producto.precio);
        
        html += `
            <div class="producto">
                <div class="producto-info">
                    <h4>${producto.descripcion}</h4>
                    <p><strong>Código:</strong> ${producto.codigo}</p>
                    ${producto.categoria ? `<p><strong>Categoría:</strong> ${producto.categoria}</p>` : ''}
                    <p class="precio"><strong>Precio contado:</strong> $${precioFormateado}</p>
                    
                    <!-- Botón para ver planes de cuotas (solo para bicicletas) -->
                    ${tipo === 'bicicletas' ? `
                        <button class="btn-ver-cuotas" onclick="togglePlanesCuotas('${producto.codigo}', ${precioNumerico})">
                            💳 Ver planes de cuotas
                        </button>
                        <div id="planes-${producto.codigo}" class="planes-cuotas"></div>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    resultadoDiv.innerHTML = html;
}

// Función para mostrar/ocultar planes (VERSIÓN COMPLETAMENTE CORREGIDA)
function togglePlanesCuotas(codigo, precioBase) {
    console.log('🔍 togglePlanesCuotas llamado con:', codigo, precioBase);
    
    const planesDiv = document.getElementById(`planes-${codigo}`);
    const boton = event.target;
    
    // Verificar si ya tiene contenido
    if (planesDiv.innerHTML === '') {
        // Calcular precios para cuotas
        const precio3Cuotas = precioBase * 1.11;  // 11% recargo
        const precio6Cuotas = precioBase * 1.20;  // 20% recargo
        
        const cuota3 = precio3Cuotas / 3;
        const cuota6 = precio6Cuotas / 6;
        
        // Generar el HTML de los planes
        const planesHTML = `
            <div class="planes-container">
                <h5>💳 Planes con tarjetas bancarias:</h5>
                <div class="plan">
                    <strong>3 cuotas sin interés:</strong><br>
                    • Total: $${formatearPrecio(precio3Cuotas.toString())}<br>
                    • Cuota: $${formatearPrecio(cuota3.toString())}
                </div>
                <div class="plan">
                    <strong>6 cuotas:</strong><br>
                    • Total: $${formatearPrecio(precio6Cuotas.toString())}<br>
                    • Cuota: $${formatearPrecio(cuota6.toString())}
                </div>
                <p style="font-size: 0.8em; color: #666; margin-top: 8px;">
                    ✅ Aceptamos todas las tarjetas
                </p>
            </div>
        `;
        
        planesDiv.innerHTML = planesHTML;
        planesDiv.style.display = 'block';
        boton.textContent = '📋 Ocultar planes';
        boton.classList.add('activo');
        
        console.log('✅ Planes generados para:', codigo);
    } else {
        // Ocultar planes
        planesDiv.innerHTML = '';
        planesDiv.style.display = 'none';
        boton.textContent = '💳 Ver planes de cuotas';
        boton.classList.remove('activo');
    }
}

// Función para convertir precios
function convertirPrecio(precioConComa) {
    if (!precioConComa) return '0';
    
    let precioLimpio = precioConComa
        .replace(/\./g, '')
        .replace(',', '.');
    
    const numero = parseFloat(precioLimpio);
    return isNaN(numero) ? '0' : numero.toString();
}

// Función para limpiar descripciones
function limpiarDescripcion(texto) {
    if (!texto) return '';
    
    return texto
        .replace(/�/g, '')
        .replace(/♦/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Función para formatear precios
function formatearPrecio(precio) {
    const numero = parseFloat(precio);
    if (isNaN(numero)) return '0.00';
    
    return numero.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Función para limpiar búsqueda
function limpiarBusqueda(tipo) {
    const inputId = tipo === 'bicicletas' ? 'searchBicicletas' : 'searchRepuestos';
    const resultadoId = tipo === 'bicicletas' ? 'resultadoBicicletas' : 'resultadoRepuestos';
    const nombreTipo = tipo === 'bicicletas' ? 'bicicletas' : 'repuestos';
    
    document.getElementById(inputId).value = '';
    document.getElementById(resultadoId).innerHTML = 
        `<p class="instrucciones">Ingresá un código o nombre para buscar ${nombreTipo}</p>`;
}

// Función para buscar con Enter
function handleKeyPress(event, tipo) {
    if (event.key === 'Enter') {
        buscarProducto(tipo);
    }
}

// Debug: Verificar que las funciones estén cargadas
console.log('✅ Script cargado - togglePlanesCuotas disponible:', typeof togglePlanesCuotas);

