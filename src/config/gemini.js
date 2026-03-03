const axios = require('axios');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

class GeminiClient {
  constructor() {
    this.client = axios.create({
      baseURL: GEMINI_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async generarContenido(prompt, opciones = {}) {
    if (!GEMINI_API_KEY) {
      throw new Error('API Key de Gemini no configurado');
    }
    try {
      const payload = {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: opciones.temperatura || 0.7,
          topK: opciones.topK || 40,
          topP: opciones.topP || 0.95,
          maxOutputTokens: opciones.maxTokens || 1024,
        },
      };
      const response = await this.client.post(
        `/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        payload
      );
      if (!response.data.candidates || response.data.candidates.length === 0) {
        throw new Error('No se recibió respuesta válida de Gemini');
      }
      const contenido = response.data.candidates[0].content.parts[0].text;
      return {
        contenido,
        metadata: {
          tokens_utilizados: response.data.usageMetadata?.totalTokenCount || 0,
        },
      };
    } catch (error) {
      console.error(' Error en Gemini:', error.response?.data || error.message);
      if (error.response?.status === 429) {
        throw new Error('Límite de tasa de Gemini excedido. Intenta más tarde.');
      }
      throw new Error(`Error de Gemini: ${error.message}`);
    }
  }

  async generarDescripcionProducto(nombre, categoria, caracteristicas = '') {
    const prompt = `
Eres un copywriter experto en e-commerce. Genera una descripción atractiva y profesional para este producto:
PRODUCTO: ${nombre}
CATEGORÍA: ${categoria}
CARACTERÍSTICAS: ${caracteristicas}
INSTRUCCIONES:
- Máximo 200 palabras
- Destaca beneficios, no solo características
- Usa un tono persuasivo pero profesional
- Estructura en párrafos cortos
Responde SOLO con la descripción, sin explicaciones adicionales.
`;
    const resultado = await this.generarContenido(prompt, {
      temperatura: 0.8,
      maxTokens: 300,
    });
    return resultado.contenido.trim();
  }

  async generarDescripcionCategoria(nombre, descripcionPropia = '') {
    const prompt = `
Eres un experto en taxonomía de e-commerce. Genera una descripción atractiva y profesional para esta categoría de productos:
CATEGORÍA: ${nombre}
DESCRIPCIÓN INICIAL: ${descripcionPropia}
INSTRUCCIONES:
- Máximo 150 palabras
- Describe qué tipo de productos se encuentran aquí
- Usa un tono acogedor y profesional
Responde SOLO con la descripción, sin explicaciones adicionales.
`;
    const resultado = await this.generarContenido(prompt, {
      temperatura: 0.7,
      maxTokens: 250,
    });
    return resultado.contenido.trim();
  }

  async sugerirCategorias(nombreProducto, descripcion) {
    const prompt = `
Analiza este producto y sugiere las 3 categorías más apropiadas:
PRODUCTO: ${nombreProducto}
DESCRIPCIÓN: ${descripcion}
CATEGORÍAS DISPONIBLES:
- Electrónicos
- Ropa y Accesorios
- Hogar y Jardín
- Deportes y Aire Libre
- Salud y Belleza
- Libros y Medios
- Juguetes y Juegos
Responde con exactamente 3 categorías de la lista, separadas por comas, sin explicaciones.
`;
    const resultado = await this.generarContenido(prompt, {
      temperatura: 0.3,
      maxTokens: 100,
    });
    return resultado.contenido.trim().split(',').map((c) => c.trim());
  }

  async analizarPatronCompras(ordenes) {
    const resumen = ordenes.map((orden) => ({
      total: orden.total,
      fecha: orden.fecha_orden,
      productos: orden.productos?.length || 0,
    }));
    const prompt = `
Analiza estos patrones de compra y genera insights:
DATOS: ${JSON.stringify(resumen)}
GENERA:
1. Patrón de frecuencia de compra
2. Promedio de gasto por orden
3. Tendencias temporales
4. Recomendaciones para el usuario
Responde en formato JSON con esta estructura:
{
"frecuencia": "descripción",
"promedio_gasto": número,
"tendencias": "descripción",
"recomendaciones": ["recomendación1", "recomendación2"]
}
`;
    try {
      const resultado = await this.generarContenido(prompt, {
        temperatura: 0.5,
        maxTokens: 400,
      });
      return JSON.parse(resultado.contenido);
    } catch (error) {
      console.error('Error parseando análisis de patrones:', error);
      return {
        frecuencia: 'No se pudo analizar',
        promedio_gasto: 0,
        tendencias: 'Datos insuficientes',
        recomendaciones: [],
      };
    }
  }
}

module.exports = new GeminiClient();
