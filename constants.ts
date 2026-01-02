
import { Student, Conversation, Announcement, PlanningUnit } from './types';

export const COURSES = ['4° Básico', '5° Básico', '6° Básico', '7° Básico', '8° Básico'];

export const STUDENTS: Student[] = [
  // 4° BÁSICO
  { id: 's4-1', rut: '25.381.370-9', name: 'VALENTÍN MANUEL NÚÑEZ LINEROS', grade: '4° Básico', attendance: 95, averageScore: 6.2, parentName: 'Apoderado Núñez', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=1' },
  { id: 's4-2', rut: '25.606.537-1', name: 'SANTIAGO IGNACIO AHUMADA DURÁN', grade: '4° Básico', attendance: 92, averageScore: 5.8, parentName: 'Apoderado Ahumada', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=2' },
  { id: 's4-3', rut: '25.727.182-K', name: 'JULIETA VALENTINA DÍAZ FARÍAS', grade: '4° Básico', attendance: 98, averageScore: 6.9, parentName: 'Apoderado Díaz', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=3' },
  { id: 's4-4', rut: '25.650.870-2', name: 'EMMA IGNACIA PEÑA GÓMEZ', grade: '4° Básico', attendance: 88, averageScore: 4.5, parentName: 'Apoderado Peña', parentEmail: '', parentPhone: '', isPIE: true, avatar: 'https://picsum.photos/100/100?random=4' },
  { id: 's4-5', rut: '25.560.644-1', name: 'IGNACIA DEL PILAR ANDREA ROJAS PARRAGUEZ', grade: '4° Básico', attendance: 94, averageScore: 6.0, parentName: 'Apoderado Rojas', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=5' },
  { id: 's4-6', rut: '25.540.299-4', name: 'ISIDORA PASCAL SALAS CUEVAS', grade: '4° Básico', attendance: 91, averageScore: 5.7, parentName: 'Apoderado Salas', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=6' },
  { id: 's4-7', rut: '25.623.942-6', name: 'MAXIMILIANO BENJAMÍN ASTORGA MARÍN', grade: '4° Básico', attendance: 93, averageScore: 6.1, parentName: 'Apoderado Astorga', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=7' },
  { id: 's4-8', rut: '25.554.070-K', name: 'CATALINA MONSERRAT GÓMEZ LINEROS', grade: '4° Básico', attendance: 96, averageScore: 6.5, parentName: 'Apoderado Gómez', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=8' },
  { id: 's4-9', rut: '25.696.689-1', name: 'JULIÁN IGNACIO MARÍN PAVEZ', grade: '4° Básico', attendance: 85, averageScore: 4.2, parentName: 'Apoderado Marín', parentEmail: '', parentPhone: '', isPIE: true, avatar: 'https://picsum.photos/100/100?random=9' },
  { id: 's4-10', rut: '25.433.801-K', name: 'DAMIÁN ALEJANDRO MEDINA BARRA', grade: '4° Básico', attendance: 90, averageScore: 5.9, parentName: 'Apoderado Medina', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=10' },

  // 5° BÁSICO
  { id: 's5-1', rut: '25.602.702-K', name: 'ALISON RENATA RAMÍREZ SÁNCHEZ', grade: '5° Básico', attendance: 98, averageScore: 6.8, parentName: 'Elena Martínez', parentEmail: 'elena.m@mail.com', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=11' },
  { id: 's5-2', rut: '24.733.764-4', name: 'JANETTE EMILIA ASTETE ASTETE', grade: '5° Básico', attendance: 87, averageScore: 5.4, parentName: 'Apoderado Astete', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=12' },
  { id: 's5-3', rut: '25.003.234-K', name: 'ANAÍS ISABEL SANDOVAL GALAZ', grade: '5° Básico', attendance: 92, averageScore: 6.3, parentName: 'Apoderado Sandoval', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=13' },
  { id: 's5-4', rut: '25.288.302-9', name: 'GASPAR ANDRÉS VALENZUELA YÁÑEZ', grade: '5° Básico', attendance: 91, averageScore: 6.0, parentName: 'Apoderado Valenzuela', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=14' },
  { id: 's5-5', rut: '25.233.205-7', name: 'ANGEL HERNÁN JIMÉNEZ FLORES', grade: '5° Básico', attendance: 95, averageScore: 5.9, parentName: 'Apoderado Jiménez', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=15' },
  { id: 's5-6', rut: '25.280.333-5', name: 'ARON ISMAEL TORRES CARRASCO', grade: '5° Básico', attendance: 89, averageScore: 5.2, parentName: 'Apoderado Torres', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=16' },
  { id: 's5-7', rut: '25.120.441-1', name: 'ANTONELLA AGUSTINA SILVA FUENZALIDA', grade: '5° Básico', attendance: 97, averageScore: 6.7, parentName: 'Apoderado Silva', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=17' },
  { id: 's5-8', rut: '25.202.068-3', name: 'AMARO IGNACIO LÓPEZ URREA', grade: '5° Básico', attendance: 93, averageScore: 6.1, parentName: 'Apoderado López', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=18' },
  { id: 's5-9', rut: '24.960.910-2', name: 'SOPHIA CATHALINA ROSALES FARÍAS', grade: '5° Básico', attendance: 90, averageScore: 5.8, parentName: 'Apoderado Rosales', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=19' },
  { id: 's5-10', rut: '25.275.272-2', name: 'ELIAN JESÚS ASTETE ASTETE', grade: '5° Básico', attendance: 94, averageScore: 6.4, parentName: 'Apoderado Astete', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=20' },

  // 6° BÁSICO
  { id: 's6-1', rut: '24.487.177-1', name: 'CRISTÓBAL JESÚS REYES VERGARA', grade: '6° Básico', attendance: 96, averageScore: 6.2, parentName: 'Apoderado Reyes', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=21' },
  { id: 's6-2', rut: '24.863.461-8', name: 'DOMINIQUE JESARELI ARENAS OYARCE', grade: '6° Básico', attendance: 85, averageScore: 4.6, parentName: 'Apoderado Arenas', parentEmail: '', parentPhone: '', isPIE: true, avatar: 'https://picsum.photos/100/100?random=22' },
  { id: 's6-3', rut: '24.851.160-6', name: 'MAITE ANTONELLA ARIAS RIQUELME', grade: '6° Básico', attendance: 92, averageScore: 5.9, parentName: 'Apoderado Arias', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=23' },
  { id: 's6-4', rut: '24.709.568-3', name: 'MARÍA PÍA CARVAJAL TOBAR', grade: '6° Básico', attendance: 98, averageScore: 6.9, parentName: 'Apoderado Carvajal', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=24' },
  { id: 's6-5', rut: '24.775.985-9', name: 'JOSEMANUEL MARTÍN CASTRO ROMÁN', grade: '6° Básico', attendance: 88, averageScore: 5.1, parentName: 'Apoderado Castro', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=25' },
  { id: 's6-6', rut: '24.712.798-4', name: 'MANUEL AGUSTÍN DÍAZ LOBOS', grade: '6° Básico', attendance: 93, averageScore: 6.3, parentName: 'Apoderado Díaz', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=26' },
  { id: 's6-7', rut: '24.794.084-7', name: 'ISMAEL ALEXANDER PASTÉN OSORIO', grade: '6° Básico', attendance: 90, averageScore: 5.5, parentName: 'Apoderado Pastén', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=27' },
  { id: 's6-8', rut: '24.798.099-7', name: 'JULIETA PEÑA GÓMEZ', grade: '6° Básico', attendance: 95, averageScore: 6.6, parentName: 'Apoderado Peña', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=28' },
  { id: 's6-9', rut: '24.827.762-9', name: 'BRUNO ESTEBAN PIÑA JARA', grade: '6° Básico', attendance: 89, averageScore: 5.0, parentName: 'Apoderado Piña', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=29' },
  { id: 's6-10', rut: '24.671.863-6', name: 'CONSTANZA PASCAL ACEVEDO VIDAL', grade: '6° Básico', attendance: 97, averageScore: 6.4, parentName: 'Apoderado Acevedo', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=30' },

  // 7° BÁSICO
  { id: 's7-1', rut: '24.512.047-8', name: 'RICARDO ALONSO BRAVO PIÑA', grade: '7° Básico', attendance: 93, averageScore: 5.6, parentName: 'Apoderado Bravo', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=31' },
  { id: 's7-2', rut: '24.367.229-5', name: 'FLORENCIA ANTONIA ALFARO PIZARRO', grade: '7° Básico', attendance: 96, averageScore: 6.7, parentName: 'Apoderado Alfaro', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=32' },
  { id: 's7-3', rut: '24.349.635-7', name: 'SANTIAGO ISMAEL ASTORGA ESPINOZA', grade: '7° Básico', attendance: 91, averageScore: 5.8, parentName: 'Apoderado Astorga', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=33' },
  { id: 's7-4', rut: '24.424.234-0', name: 'VIOLETA ANTONIA ASTORGA MARÍN', grade: '7° Básico', attendance: 94, averageScore: 6.2, parentName: 'Apoderado Astorga', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=34' },
  { id: 's7-5', rut: '24.358.566-K', name: 'MATEO ALONSO GONZÁLEZ QUINTANA', grade: '7° Básico', attendance: 90, averageScore: 5.5, parentName: 'Apoderado González', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=35' },
  { id: 's7-6', rut: '24.584.523-5', name: 'MÁXIMO ESTEFANO JARPA CÓRDOVA', grade: '7° Básico', attendance: 88, averageScore: 5.1, parentName: 'Apoderado Jarpa', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=36' },
  { id: 's7-7', rut: '24.508.550-8', name: 'EMILY PASCAL LIZANA ASTORGA', grade: '7° Básico', attendance: 95, averageScore: 6.4, parentName: 'Apoderado Lizana', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=37' },
  { id: 's7-8', rut: '24.519.693-8', name: 'VICENTE BALTAZAR MENA TORREJÓN', grade: '7° Básico', attendance: 92, averageScore: 5.9, parentName: 'Apoderado Mena', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=38' },
  { id: 's7-9', rut: '24.448.895-1', name: 'CATALINA ANDREA PÉREZ REYES', grade: '7° Básico', attendance: 97, averageScore: 6.6, parentName: 'Apoderado Pérez', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=39' },
  { id: 's7-10', rut: '24.327.901-1', name: 'JULIÁN IGNACIO RIVERA RAMÍREZ', grade: '7° Básico', attendance: 90, averageScore: 5.3, parentName: 'Apoderado Rivera', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=40' },

  // 8° BÁSICO
  { id: 's8-1', rut: '24.058.274-0', name: 'TRINIDAD IGNACIA ORTIZ MELLA', grade: '8° Básico', attendance: 96, averageScore: 6.5, parentName: 'Apoderado Ortiz', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=41' },
  { id: 's8-2', rut: '23.704.437-1', name: 'AGUSTINA TRINIDAD CUEVAS VARGAS', grade: '8° Básico', attendance: 89, averageScore: 5.2, parentName: 'Apoderado Cuevas', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=42' },
  { id: 's8-3', rut: '24.152.200-8', name: 'AGUSTÍN ANTONIO RÍOS FERNÁNDEZ', grade: '8° Básico', attendance: 94, averageScore: 6.1, parentName: 'Apoderado Ríos', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=43' },
  { id: 's8-4', rut: '24.165.100-2', name: 'ISIDORA SCARLET VERDEJO ESPINOZA', grade: '8° Básico', attendance: 90, averageScore: 5.4, parentName: 'Apoderado Verdejo', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=44' },
  { id: 's8-5', rut: '24.124.670-1', name: 'IGNACIA ARACELLI ZAPATA LÓPEZ', grade: '8° Básico', attendance: 92, averageScore: 5.8, parentName: 'Apoderado Zapata', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=45' },
  { id: 's8-6', rut: '24.294.639-1', name: 'FLORENCIA ANAÍS ARENAS LÓPEZ', grade: '8° Básico', attendance: 95, averageScore: 6.7, parentName: 'Apoderado Arenas', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=46' },
  { id: 's8-7', rut: '24.231.035-7', name: 'JORGE IGNACIO BRAVO SEQUEIDA', grade: '8° Básico', attendance: 87, averageScore: 4.9, parentName: 'Apoderado Bravo', parentEmail: '', parentPhone: '', isPIE: true, avatar: 'https://picsum.photos/100/100?random=47' },
  { id: 's8-8', rut: '23.988.745-7', name: 'TOMÁS ALEXIS CABELLO LLANCAFIL', grade: '8° Básico', attendance: 91, averageScore: 6.0, parentName: 'Apoderado Cabello', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=48' },
  { id: 's8-9', rut: '24.288.215-6', name: 'MARIPAZ VALENTINA DONOSO LÓPEZ', grade: '8° Básico', attendance: 94, averageScore: 6.3, parentName: 'Apoderado Donoso', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=49' },
  { id: 's8-10', rut: '23.914.875-1', name: 'JOSÉ ANDRÉS GAETE LÓPEZ', grade: '8° Básico', attendance: 88, averageScore: 5.3, parentName: 'Apoderado Gaete', parentEmail: '', parentPhone: '', isPIE: false, avatar: 'https://picsum.photos/100/100?random=50' }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    studentId: 's5-1',
    parentName: 'ELENA MARTÍNEZ',
    lastMessage: 'Recibido, muchas gracias profesor por el reporte de Alison.',
    unreadCount: 0,
    messages: [
      { id: 'm1', senderId: 'teacher', senderName: 'Prof. Yonathan Herrera', content: 'Estimada Sra. Elena, le informo que Alison ha tenido un gran desempeño en la unidad de fracciones.', timestamp: new Date(Date.now() - 86400000), isMine: true }
    ]
  },
  {
    id: 'c2',
    studentId: 's4-1',
    parentName: 'ROBERTO NÚÑEZ',
    lastMessage: '¿A qué hora es el taller de geometría de mañana?',
    unreadCount: 1,
    messages: [
      { id: 'm2', senderId: 'parent', senderName: 'Roberto Núñez', content: '¿A qué hora es el taller de geometría de mañana?', timestamp: new Date(), isMine: false }
    ]
  },
  {
    id: 'c3',
    studentId: 's6-1',
    parentName: 'CLAUDIA VERGARA',
    lastMessage: 'Entendido profesor, reforzaremos en casa.',
    unreadCount: 0,
    messages: [
      { id: 'm3', senderId: 'teacher', senderName: 'Prof. Yonathan Herrera', content: 'Claudia, Cristóbal debe repasar las potencias.', timestamp: new Date(Date.now() - 3600000), isMine: true }
    ]
  }
];

export const ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', title: 'Nómina Oficial Cargada', content: 'Se ha completado la carga de alumnos para el ciclo 2024.', date: '2024-03-20', category: 'General' },
  { id: 'a2', title: 'Control de Multiplicación', content: 'Evaluación rápida de tablas del 1 al 10.', date: '2024-03-25', category: 'Evaluación', grade: '5° Básico' },
  { id: 'a3', title: 'Taller de Geometría', content: 'Inscripciones abiertas para reforzamiento de perímetros.', date: '2024-03-22', category: 'General', grade: '4° Básico' },
  { id: 'a4', title: 'Prueba Ecuaciones', content: 'Preparar guía n°3 de lenguaje algebraico.', date: '2024-03-28', category: 'Evaluación', grade: '8° Básico' }
];

export const PLANNING_DATA: PlanningUnit[] = [
  { id: 'u1', title: 'Unidad 1: Números y Operaciones', description: 'Consolidación de las bases matemáticas del nivel.', startDate: '2024-03-01', endDate: '2024-04-15', status: 'En Progreso', upcomingExamDate: '2024-04-05', resources: ['Guía Práctica 1'], grade: '5° Básico' },
  { id: 'u2', title: 'Unidad 1: Álgebra Básica', description: 'Introducción a variables y expresiones.', startDate: '2024-03-01', endDate: '2024-04-10', status: 'En Progreso', upcomingExamDate: '2024-04-02', resources: ['PPT Introducción'], grade: '7° Básico' }
];
