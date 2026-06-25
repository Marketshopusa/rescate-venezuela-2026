/**
 * RESCATE VENEZUELA 2026 - Generador de Carteles y Compartido en Redes (Con QR)
 * Utiliza html2canvas para crear imágenes y Clipboard API para textos.
 */

// SVG por defecto para personas sin foto (Silueta Neutral)
const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234b5563' width='100' height='100'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";

/**
 * Prepara y descarga el cartel de búsqueda en formato de imagen PNG (1080x1920)
 * @param {Object} person Objeto con los datos de la persona
 * @param {HTMLButtonElement} btnElement Botón que disparó la acción para cambiar su estado visual
 */
function downloadPoster(person, btnElement) {
    const originalBtnText = btnElement.innerHTML;
    btnElement.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generando...`;
    btnElement.disabled = true;

    // Obtener elementos de la plantilla del cartel
    const poster = document.getElementById('offscreen-poster');
    const pPhoto = document.getElementById('poster-photo');
    const pMainTitle = document.getElementById('poster-main-title');
    const pName = document.getElementById('poster-name');
    const pAge = document.getElementById('poster-age');
    const pGender = document.getElementById('poster-gender');
    const pLocation = document.getElementById('poster-location');
    const pAddress = document.getElementById('poster-address');
    const pDescription = document.getElementById('poster-description');
    const pPhone = document.getElementById('poster-phone');
    const pContactName = document.getElementById('poster-contact-name');
    const pQr = document.getElementById('poster-qr');
    const posterCard = poster.querySelector('.poster-card');

    // Configurar Foto
    pPhoto.src = person.photo || DEFAULT_AVATAR;

    // Configurar Textos Básicos
    pName.innerText = person.name;
    pAge.innerText = `${person.age} años`;
    pGender.innerText = person.gender;
    pLocation.innerText = `${person.city}, Edo. ${person.state}`;
    pAddress.innerText = person.address;
    pDescription.innerText = person.description || 'Sin señas particulares adicionales registradas.';
    pPhone.innerText = person.contactPhone;
    pContactName.innerText = `Contacto: ${person.contactName}`;

    // Configurar Estilo y Títulos de acuerdo al estatus de la persona
    posterCard.style.borderColor = 'var(--color-red)';
    pMainTitle.style.color = 'var(--color-red)';
    pMainTitle.style.textShadow = '0 5px 15px rgba(239, 68, 68, 0.3)';

    if (person.status === 'Desaparecido') {
        pMainTitle.innerText = 'SE BUSCA';
        posterCard.style.borderColor = '#ef4444'; // Rojo
        pMainTitle.style.color = '#ef4444';
    } else if (person.status === 'Hospitalizado') {
        pMainTitle.innerText = 'HOSPITALIZADO';
        posterCard.style.borderColor = '#f59e0b'; // Amarillo
        pMainTitle.style.color = '#f59e0b';
        pMainTitle.style.textShadow = '0 5px 15px rgba(245, 158, 11, 0.3)';
    } else if (person.status === 'Localizado a Salvo') {
        pMainTitle.innerText = 'LOCALIZADO';
        posterCard.style.borderColor = '#10b981'; // Verde
        pMainTitle.style.color = '#10b981';
        pMainTitle.style.textShadow = '0 5px 15px rgba(16, 185, 129, 0.3)';
    } else if (person.status === 'Fallecido') {
        pMainTitle.innerText = 'FALLECIDO';
        posterCard.style.borderColor = '#4b5563'; // Gris oscuro
        pMainTitle.style.color = '#9ca3af';
        pMainTitle.style.textShadow = 'none';
    }

    // Configurar Código QR Dinámico (Enlace directo a la web)
    const siteUrl = encodeURIComponent(window.location.href);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${siteUrl}`;
    
    // Habilitar carga CORS
    pQr.crossOrigin = "anonymous";

    const triggerCanvasRender = () => {
        html2canvas(posterCard, {
            scale: 2, // Excelente resolución para compartir en historias
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#0a0d16'
        }).then(canvas => {
            try {
                const imgData = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                
                // Formatear nombre de archivo
                const safeName = person.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_');
                link.download = `cartel_${person.status.replace(/\s+/g, '_').toLowerCase()}_${safeName}.png`;
                link.href = imgData;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (err) {
                console.error("Error al exportar imagen con html2canvas: ", err);
                alert("Hubo un error al generar la imagen. Intenta de nuevo.");
            } finally {
                btnElement.innerHTML = originalBtnText;
                btnElement.disabled = false;
            }
        }).catch(err => {
            console.error("Error en renderizado: ", err);
            btnElement.innerHTML = originalBtnText;
            btnElement.disabled = false;
        });
    };

    // Esperar a que se cargue la imagen del QR antes de renderizar la tarjeta
    let qrLoaded = false;
    pQr.onload = () => {
        if (!qrLoaded) {
            qrLoaded = true;
            // Pequeño retardo adicional para asegurar refresco del DOM en navegadores móviles
            setTimeout(triggerCanvasRender, 200);
        }
    };

    pQr.onerror = () => {
        console.warn("No se pudo cargar el QR desde la API, renderizando sin él.");
        pQr.src = DEFAULT_AVATAR; // Fallback
        setTimeout(triggerCanvasRender, 200);
    };

    // Asignar el src dispara el onload
    pQr.src = qrUrl;
}

/**
 * Genera y copia el texto formateado de búsqueda al portapapeles
 * @param {Object} person Objeto con los datos de la persona
 * @param {HTMLButtonElement} btnElement Botón que disparó la acción para cambiar su estado visual
 */
function copySocialText(person, btnElement) {
    const originalText = btnElement.innerHTML;
    
    // Emojis según el estatus
    let statusEmoji = '🆘';
    if (person.status === 'Hospitalizado') statusEmoji = '🏥';
    if (person.status === 'Localizado a Salvo') statusEmoji = '✅';
    if (person.status === 'Fallecido') statusEmoji = '🕊️';

    // Construir enlace directo a la web
    const siteUrl = window.location.href;

    const textToCopy = `${statusEmoji} ${person.status.toUpperCase()}: ${person.name.toUpperCase()}

📌 DETALLES:
• Edad: ${person.age} años
• Género: ${person.gender}
• Ubicación: ${person.city}, Estado ${person.state}
• Último lugar visto: ${person.address}
${person.description ? `• Señas Particulares/Info: ${person.description}` : ''}

📞 SI TIENES INFORMACIÓN O LO HAS VISTO, COMUNÍCATE CON:
Contacto: ${person.contactName}
Teléfono (WhatsApp): ${person.contactPhone}

🔗 Consulta más información, reporta avistamientos o sube otros reportes aquí:
${siteUrl}

Por favor ayuda compartiendo esta información en tus estados e historias. 
#RescateVenezuela2026 #SismoVenezuela2026 #DesaparecidosVenezuela #ServicioPublico`;

    navigator.clipboard.writeText(textToCopy).then(() => {
        btnElement.innerHTML = `<i class="fa-solid fa-check"></i> ¡Copiado!`;
        btnElement.style.backgroundColor = 'var(--color-green-bg)';
        btnElement.style.color = 'var(--color-green)';
        btnElement.style.borderColor = 'var(--color-green)';
        
        setTimeout(() => {
            btnElement.innerHTML = originalText;
            btnElement.style.backgroundColor = '';
            btnElement.style.color = '';
            btnElement.style.borderColor = '';
        }, 2000);
    }).catch(err => {
        console.error('Error al copiar al portapapeles: ', err);
        alert('No se pudo copiar automáticamente. Por favor copia la información manualmente.');
    });
}
