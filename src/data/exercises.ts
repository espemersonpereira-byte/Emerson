import { Exercise, MuscleGroup, EquipmentType } from '../types';

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'Peito',
  'Costas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Quadríceps',
  'Posterior da coxa',
  'Glúteos',
  'Panturrilhas',
  'Abdômen',
  'Antebraços',
  'Cardio',
  'Corpo inteiro',
];

export const EQUIPMENT_TYPES: EquipmentType[] = [
  'Máquinas',
  'Halteres',
  'Barras',
  'Polias',
  'Peso corporal',
  'Elásticos',
  'Equipamentos cardiovasculares',
];

export const DEFAULT_EXERCISES: Exercise[] = [
  // =========================================================================
  // SEGUNDA-FEIRA: PEITO + TRÍCEPS
  // =========================================================================
  {
    id: 'peck_deck',
    name: 'Deck de Peck / Voador',
    primaryMuscle: 'Peito',
    secondaryMuscles: ['Ombros'],
    equipment: 'Máquinas',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'peck_deck',
    description: 'Exercício isolado em máquina excelente para ativação do peitoral maior com tensão constante durante toda a adução horizontal dos ombros.',
    initialPosition: 'Sente-se no aparelho com a coluna totalmente apoiada no encosto, escápulas retraídas e cotovelos alinhados pouco abaixo da linha dos ombros.',
    stepByStep: [
      'Ajuste a altura do banco para que os punhos ou antebraços fiquem na linha média do peitoral.',
      'Empurre as alças ou apoios para o centro descrevendo um arco amplo com o peito estufado.',
      'Contraia fortemente o peitoral por 1 segundo no ponto central sem desencostar as costas.',
      'Retorne de forma controlada até sentir alongamento confortável nas fibras peitorais.'
    ],
    breathing: 'Expire ao fechar os braços no centro (fase concêntrica) e inspire ao retornar abrindo os braços.',
    commonMistakes: [
      'Projetar os ombros para a frente ao fechar os braços.',
      'Hiperestender excessivamente a articulação do ombro no retorno.',
      'Descolar a cabeça ou a coluna torácica do banco.'
    ],
    safetyTips: [
      'Configure o limitador de amplitude da máquina para não forçar a cápsula articular anterior do ombro.',
      'Mantenha os pés firmes no chão para estabilidade pélvica.'
    ],
    defaultSets: 2,
    defaultMinReps: 10,
    defaultMaxReps: 15,
    defaultWeight: 40,
    defaultRestSeconds: 90,
  },
  {
    id: 'incline_bench_press',
    name: 'Supino inclinado',
    primaryMuscle: 'Peito',
    secondaryMuscles: ['Ombros', 'Tríceps'],
    equipment: 'Barras',
    type: 'Composto',
    metricMode: 'reps_weight',
    archetype: 'incline_press',
    description: 'Movimento composto fundamental com foco na porção clavicular (superior) do peitoral maior e deltoide anterior.',
    initialPosition: 'Deite-se no banco inclinado (30° a 45°), retraia e deprima as escápulas, pés firmes no solo e pegada ligeiramente mais larga que a largura dos ombros.',
    stepByStep: [
      'Retire a barra do suporte estabilizando os punhos alinhados aos antebraços.',
      'Desça a barra de forma controlada em direção à parte superior do peitoral (próximo à clavícula).',
      'Empurre a barra verticalmente de volta até próximo da extensão completa, mantendo tensão no peito.'
    ],
    breathing: 'Inspire durante a descida controlada da barra e expire vigorosamente ao empurrar a carga.',
    commonMistakes: [
      'Abrir os cotovelos a 90° em relação ao tronco, sobrecarregando os ombros.',
      'Usar inclinação excessiva (>60°), transformando o exercício em desenvolvimento de ombros.',
      'Quicar a barra no tórax.'
    ],
    safetyTips: [
      'Mantenha os cotovelos em um ângulo aproximado de 45° a 60° em relação ao tronco.',
      'Utilize travas de segurança e peça auxílio em cargas submáximas.'
    ],
    defaultSets: 2,
    defaultMinReps: 8,
    defaultMaxReps: 12,
    defaultWeight: 30,
    defaultRestSeconds: 120,
  },
  {
    id: 'flat_bench_press',
    name: 'Supino reto',
    primaryMuscle: 'Peito',
    secondaryMuscles: ['Tríceps', 'Ombros'],
    equipment: 'Barras',
    type: 'Composto',
    metricMode: 'reps_weight',
    archetype: 'flat_press',
    description: 'Clássico construtor de força e volume para toda a extensão esternocostal do peitoral, tríceps e deltoides.',
    initialPosition: 'Deitado no banco plano, olhos abaixo da barra, escápulas firmemente aduzidas no estofado e pés plantados no chão.',
    stepByStep: [
      'Segure a barra com pegada firme envolvendo os polegares.',
      'Desça a barra controladamente até tocar suavemente a linha média/inferior do esterno.',
      'Empurre a barra para cima e levemente para trás em direção ao suporte.'
    ],
    breathing: 'Inspire na fase excêntrica (descida) e expire ao passar pelo ponto de maior dificuldade na subida.',
    commonMistakes: [
      'Tirar os glúteos do banco durante o esforço.',
      'Dobrar os punhos para trás, perdendo transferência de força.',
      'Perder a retração escapular no topo do movimento.'
    ],
    safetyTips: [
      'Sempre utilize a pegada fechada com o polegar envolvendo a barra.',
      'Respeite o alinhamento natural dos cotovelos.'
    ],
    defaultSets: 2,
    defaultMinReps: 8,
    defaultMaxReps: 12,
    defaultWeight: 40,
    defaultRestSeconds: 120,
  },
  {
    id: 'high_cable_crossover',
    name: 'Crossover na polia alta',
    primaryMuscle: 'Peito',
    secondaryMuscles: ['Ombros'],
    equipment: 'Polias',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'cable_high',
    description: 'Isolamento em cabos com vetor descendente que enfatiza as fibras esternais e inferiores do peitoral com contração máxima.',
    initialPosition: 'Posicione as polias no ponto mais alto, segure os puxadores, dê um passo à frente e incline levemente o tronco mantendo o abdômen firme.',
    stepByStep: [
      'Com os cotovelos levemente flexionados e fixos, puxe os cabos para baixo e para o centro.',
      'Una as mãos à frente do quadril ou baixo abdômen contraindo o peitoral.',
      'Retorne devagar acompanhando a linha dos cabos até a altura do peito.'
    ],
    breathing: 'Expire ao cruzar/aproximar as mãos à frente e inspire na abertura controlada.',
    commonMistakes: [
      'Flexionar e estender demais os cotovelos transformando o movimento em supino.',
      'Balançar o tronco para gerar impulso.',
      'Encolher o trapézio durante a contração.'
    ],
    safetyTips: [
      'Use base anteroposterior (um pé à frente do outro) para proteger a coluna lombar.',
      'Controle o retorno dos cabos antes que os pesos batam na torre.'
    ],
    defaultSets: 2,
    defaultMinReps: 10,
    defaultMaxReps: 15,
    defaultWeight: 15,
    defaultRestSeconds: 90,
  },
  {
    id: 'low_cable_crossover',
    name: 'Crossover na polia baixa',
    primaryMuscle: 'Peito',
    secondaryMuscles: ['Ombros', 'Bíceps'],
    equipment: 'Polias',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'cable_low',
    description: 'Crucifixo em cabos partindo da polia baixa com trajetória ascendente, trabalhando intensamente o peitoral superior (clavicular).',
    initialPosition: 'Ajuste as polias na base inferior, segure os puxadores com as palmas voltadas para a frente/cima e posicione-se no centro da estação.',
    stepByStep: [
      'Mantenha o peito alto e cotovelos semifinalizados.',
      'Eleve os braços para cima e para o centro até a altura da linha do queixo/peito superior.',
      'Segure 1 segundo no topo e desça controlando a resistência.'
    ],
    breathing: 'Expire ao elevar e unir os cabos; inspire ao descer os braços.',
    commonMistakes: [
      'Usar o bíceps dobrando o cotovelo em vez de aduzir o úmero.',
      'Inclinar o corpo para trás para roubar com a lombar.'
    ],
    safetyTips: [
      'Priorize a execução limpa com carga moderada para sentir o feixe clavicular.',
      'Mantenha os ombros baixos longe das orelhas.'
    ],
    defaultSets: 2,
    defaultMinReps: 10,
    defaultMaxReps: 15,
    defaultWeight: 10,
    defaultRestSeconds: 90,
  },
  {
    id: 'french_press',
    name: 'Tríceps francês',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: ['Ombros'],
    equipment: 'Halteres',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'french_press',
    description: 'Extensão de cotovelos acima da cabeça que promove excelente alongamento e recrutamento da cabeça longa do tríceps braquial.',
    initialPosition: 'Sentado ou em pé com a coluna ereta, segure o halter acima da cabeça com ambas as mãos (ou unilateralmente) e cotovelos apontados para cima.',
    stepByStep: [
      'Estabilize o úmero próximo à linha das orelhas.',
      'Flexione os cotovelos descendo o peso atrás da cabeça de forma controlada.',
      'Estenda os cotovelos levando a carga de volta ao topo sem movimentar os ombros.'
    ],
    breathing: 'Inspire ao descer o halter atrás da cabeça e expire ao estender os braços.',
    commonMistakes: [
      'Abrir demais os cotovelos durante a subida.',
      'Arquear excessivamente a região lombar por falta de contração abdominal.'
    ],
    safetyTips: [
      'Utilize um banco com apoio curto nas costas para proteger a coluna.',
      'Evite cargas que impeçam a amplitude completa com controle.'
    ],
    defaultSets: 2,
    defaultMinReps: 10,
    defaultMaxReps: 15,
    defaultWeight: 16,
    defaultRestSeconds: 90,
  },
  {
    id: 'triceps_pushdown',
    name: 'Tríceps na polia',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: ['Antebraços'],
    equipment: 'Polias',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'triceps_pushdown',
    description: 'Isolamento clássico para as cabeças lateral e medial do tríceps utilizando barra reta, barra W ou corda na polia alta.',
    initialPosition: 'Em pé diante da polia alta, pés paralelos, tronco levemente inclinado à frente e cotovelos fixos ao lado das costelas.',
    stepByStep: [
      'Segure a barra ou corda com os punhos firmes e neutros.',
      'Empurre o acessório para baixo até a extensão completa dos cotovelos.',
      'Retorne controladamente até o antebraço passar pouco acima da linha horizontal.'
    ],
    breathing: 'Expire ao estender os braços para baixo e inspire na subida.',
    commonMistakes: [
      'Movimentar os cotovelos para a frente e para trás usando o dorsal/ombro.',
      'Jogar o peso do tronco sobre a barra.'
    ],
    safetyTips: [
      'Mantenha os ombros deprimidos e punhos alinhados.',
      'Foque em travar apenas os cotovelos.'
    ],
    defaultSets: 2,
    defaultMinReps: 10,
    defaultMaxReps: 15,
    defaultWeight: 25,
    defaultRestSeconds: 75,
  },

  // =========================================================================
  // TERÇA-FEIRA: QUADRÍCEPS + PANTURRILHA
  // =========================================================================
  {
    id: 'leg_extension',
    name: 'Cadeira extensora',
    primaryMuscle: 'Quadríceps',
    secondaryMuscles: [],
    equipment: 'Máquinas',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'leg_extension',
    description: 'Único exercício que isola diretamente as quatro porções do quadríceps femoral com pico de contração na extensão total do joelho.',
    initialPosition: 'Ajuste o encosto para que a dobra do joelho fique exatamente alinhada ao eixo de rotação da máquina e o rolo apoiado sobre a parte inferior da canela.',
    stepByStep: [
      'Segure firme nos apoios laterais puxando o quadril contra o banco.',
      'Estenda os joelhos completamente até as pernas ficarem retas.',
      'Sustente 1 segundo no topo contraindo o quadríceps e desça de forma controlada.'
    ],
    breathing: 'Expire durante a extensão dos joelhos e inspire na descida.',
    commonMistakes: [
      'Levantar o quadril do assento para dar impulso.',
      'Soltar o peso bruscamente na descida.',
      'Deixar o eixo da máquina desalinhado com a articulação do joelho.'
    ],
    safetyTips: [
      'Nunca posicione o rolo sobre o peito do pé; mantenha-o na região distal da tíbia.',
      'Realize uma série de aquecimento leve para lubrificar a articulação patelofemoral.'
    ],
    defaultSets: 2,
    defaultMinReps: 10,
    defaultMaxReps: 15,
    defaultWeight: 45,
    defaultRestSeconds: 90,
  },
  {
    id: 'leg_press_45',
    name: 'Leg press 45°',
    primaryMuscle: 'Quadríceps',
    secondaryMuscles: ['Glúteos', 'Posterior da coxa'],
    equipment: 'Máquinas',
    type: 'Composto',
    metricMode: 'reps_weight',
    archetype: 'leg_press',
    description: 'Exercício multiarticular potente para desenvolvimento de força e hipertrofia dos membros inferiores com coluna estabilizada.',
    initialPosition: 'Sente-se no aparelho com a lombar e o quadril totalmente colados ao encosto, pés posicionados na plataforma na largura dos ombros.',
    stepByStep: [
      'Empurre a plataforma e destrave as alavancas de segurança.',
      'Flexione os joelhos descendo a plataforma até cerca de 90° sem que o quadril desencoste do banco.',
      'Empurre com toda a planta dos pés (especialmente calcanhares) sem hiperestender/travar os joelhos no topo.'
    ],
    breathing: 'Inspire profundamente na descida e expire ao empurrar a plataforma.',
    commonMistakes: [
      'Travar completamente os joelhos no final do movimento.',
      'Descer além da mobilidade pélvica, fazendo a lombar enrolar (retroversão pélvica).',
      'Deixar os joelhos caírem para dentro (valgo dinâmico).'
    ],
    safetyTips: [
      'Jamais estenda 100% os joelhos sob carga pesada; mantenha-os destravados.',
      'Certifique-se de travar o suporte nos dois lados antes de relaxar as pernas.'
    ],
    defaultSets: 2,
    defaultMinReps: 8,
    defaultMaxReps: 12,
    defaultWeight: 120,
    defaultRestSeconds: 120,
  },
  {
    id: 'squat',
    name: 'Agachamento',
    primaryMuscle: 'Quadríceps',
    secondaryMuscles: ['Glúteos', 'Posterior da coxa', 'Abdômen'],
    equipment: 'Barras',
    type: 'Composto',
    metricMode: 'reps_weight',
    archetype: 'squat',
    description: 'Exercício base fundamental do treinamento de força, recrutando quadríceps, glúteos, adutores e musculatura estabilizadora do core.',
    initialPosition: 'Apoie a barra sobre o trapézio (barra alta) ou deltoide posterior, pés na largura dos ombros com pontas levemente voltadas para fora.',
    stepByStep: [
      'Inspire fundo pressurizando o abdômen (bracing).',
      'Inicie o movimento flexionando simultaneamente quadris e joelhos, mantendo o peito aberto.',
      'Desça até as coxas atingirem pelo menos a linha paralela ao solo.',
      'Empurre o chão com os pés retornando à postura inicial.'
    ],
    breathing: 'Inspire e segure a pressão intra-abdominal na descida, expirando no terço final da subida.',
    commonMistakes: [
      'Deixar os joelhos colapsarem para dentro na subida.',
      'Elevar o quadril muito antes do tronco (agachamento "bom dia").',
      'Tirar os calcanhares do chão.'
    ],
    safetyTips: [
      'Mantenha os joelhos alinhados na direção da ponta dos pés.',
      'Ajuste as barras de segurança do rack na altura adequada.'
    ],
    defaultSets: 2,
    defaultMinReps: 8,
    defaultMaxReps: 12,
    defaultWeight: 50,
    defaultRestSeconds: 120,
  },
  {
    id: 'hip_abduction',
    name: 'Cadeira abdutora',
    primaryMuscle: 'Glúteos',
    secondaryMuscles: ['Quadríceps'],
    equipment: 'Máquinas',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'abduction',
    description: 'Isolamento direcionado para o glúteo médio, glúteo mínimo e fibras superiores do glúteo máximo, essenciais para estabilidade pélvica.',
    initialPosition: 'Sente-se na máquina com os apoios posicionados na face lateral externa dos joelhos e coluna estabilizada.',
    stepByStep: [
      'Afaste as pernas para fora de maneira firme e controlada.',
      'Sustente a contração máxima dos glúteos laterais por 1 segundo.',
      'Retorne devagar sem deixar as placas de peso baterem.'
    ],
    breathing: 'Expire ao abrir as pernas e inspire ao retornar.',
    commonMistakes: [
      'Executar repetições curtas e rápidas usando o elástico muscular.',
      'Girar os pés excessivamente perdendo o alinhamento dos quadris.'
    ],
    safetyTips: [
      'Mantenha o quadril fixo e priorize o tempo sob tensão.'
    ],
    defaultSets: 2,
    defaultMinReps: 10,
    defaultMaxReps: 15,
    defaultWeight: 45,
    defaultRestSeconds: 75,
  },
  {
    id: 'seated_calf_raise',
    name: 'Panturrilha sentado ou na máquina',
    primaryMuscle: 'Panturrilhas',
    secondaryMuscles: [],
    equipment: 'Máquinas',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'calf_raise',
    description: 'Flexão plantar focada no sóleo e gastrocnêmio, trabalhando toda a amplitude do tornozelo.',
    initialPosition: 'Apoie apenas a parte anterior da planta dos pés (metatarsos) na plataforma, deixando os calcanhares livres.',
    stepByStep: [
      'Desça os calcanhares o máximo possível alongando bem o tendão calcâneo e a panturrilha.',
      'Suba na ponta dos pés até a contração máxima e segure por 1 a 2 segundos no topo.',
      'Desça controladamente para a próxima repetição.'
    ],
    breathing: 'Expire ao subir na ponta dos pés e inspire ao alongar os calcanhares para baixo.',
    commonMistakes: [
      'Quicar no fundo do movimento sem pausar.',
      'Fazer amplitude curta sem subir até o limite.'
    ],
    safetyTips: [
      'Faça uma breve pausa de 1 segundo no alongamento inferior para anular o reflexo elástico do tendão de Aquiles.'
    ],
    defaultSets: 2,
    defaultMinReps: 12,
    defaultMaxReps: 20,
    defaultWeight: 35,
    defaultRestSeconds: 60,
  },
  {
    id: 'stationary_bike',
    name: 'Bicicleta ergométrica por 20 minutos',
    primaryMuscle: 'Cardio',
    secondaryMuscles: ['Quadríceps', 'Panturrilhas'],
    equipment: 'Equipamentos cardiovasculares',
    type: 'Cardio',
    metricMode: 'duration_minutes',
    archetype: 'bike',
    description: 'Condicionamento aeróbico de baixo impacto articular em bicicleta ergométrica vertical ou horizontal.',
    initialPosition: 'Ajuste a altura do selim na linha do quadril (em pé ao lado da bicicleta), mantendo leve flexão de joelho no ponto mais baixo do pedal.',
    stepByStep: [
      'Inicie pedalando em cadência confortável (70 a 90 RPM) nos primeiros 3 minutos.',
      'Mantenha carga moderada contínua pelos 20 minutos programados.',
      'Desacelere gradualmente no último minuto para recuperação da frequência cardíaca.'
    ],
    breathing: 'Respiração rítmica e profunda pelo nariz e boca.',
    commonMistakes: [
      'Usar o banco muito baixo, sobrecarregando a patela.',
      'Apoiar todo o peso do tronco sobre os punhos no guidão.'
    ],
    safetyTips: [
      'Ajuste as tiras dos pedais e mantenha hidratação durante o cardio.'
    ],
    defaultSets: 1,
    defaultMinReps: 20,
    defaultMaxReps: 20,
    defaultWeight: 0,
    defaultRestSeconds: 60,
  },

  // =========================================================================
  // QUARTA-FEIRA: COSTAS + BÍCEPS + OMBRO
  // =========================================================================
  {
    id: 'lat_pulldown',
    name: 'Puxada alta',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps', 'Ombros'],
    equipment: 'Polias',
    type: 'Composto',
    metricMode: 'reps_weight',
    archetype: 'lat_pulldown',
    description: 'Exercício principal de tração vertical para expansão do grande dorsal, redondo maior e trapézio inferior.',
    initialPosition: 'Sente-se e prenda as coxas sob os rolos de apoio. Segure a barra com pegada aberta pronada, um pouco além da largura dos ombros.',
    stepByStep: [
      'Inicie o movimento deprimindo as escápulas (abaixando os ombros).',
      'Puxe a barra em direção à parte superior do peitoral, apontando os cotovelos para o chão.',
      'Retorne a barra de maneira controlada até alongar completamente os dorsais.'
    ],
    breathing: 'Expire ao puxar a barra até o peito e inspire ao estender os braços.',
    commonMistakes: [
      'Puxar a barra atrás da nuca (aumenta o risco de impacto articular no ombro).',
      'Jogar o tronco excessivamente para trás transformando em remada.'
    ],
    safetyTips: [
      'Imagine que suas mãos são apenas ganchos e puxe pelos cotovelos.'
    ],
    defaultSets: 2,
    defaultMinReps: 8,
    defaultMaxReps: 12,
    defaultWeight: 45,
    defaultRestSeconds: 90,
  },
  {
    id: 'seated_cable_row',
    name: 'Remada baixa',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps', 'Ombros'],
    equipment: 'Polias',
    type: 'Composto',
    metricMode: 'reps_weight',
    archetype: 'seated_row',
    description: 'Tração horizontal na polia baixa excelente para espessura dorsal, romboides, trapézio médio e grande dorsal.',
    initialPosition: 'Sente-se no banco, apoie os pés na plataforma com joelhos semiflexionados e mantenha a coluna neutra e peito aberto.',
    stepByStep: [
      'Puxe o triângulo ou barra em direção ao abdômen inferior, retraindo as escápulas.',
      'Mantenha os cotovelos próximos ao corpo e segure 1 segundo na contração máxima.',
      'Alongue os braços à frente controladamente sem curvar a lombar.'
    ],
    breathing: 'Expire ao puxar o puxador até o abdômen e inspire ao alongar.',
    commonMistakes: [
      'Gangorrar o tronco para a frente e para trás usando a lombar.',
      'Elevar os ombros em direção às orelhas.'
    ],
    safetyTips: [
      'Preserve a curvatura natural da coluna lombar durante toda a série.'
    ],
    defaultSets: 2,
    defaultMinReps: 8,
    defaultMaxReps: 12,
    defaultWeight: 45,
    defaultRestSeconds: 90,
  },
  {
    id: 't_bar_row',
    name: 'Remada cavalinho',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps', 'Ombros', 'Antebraços'],
    equipment: 'Barras',
    type: 'Composto',
    metricMode: 'reps_weight',
    archetype: 't_bar_row',
    description: 'Remada pesada para construção de densidade muscular em toda a musculatura das costas.',
    initialPosition: 'Posicione os pés na largura dos ombros (ou apoie o peito se for máquina cavalinho articulada), incline o tronco a cerca de 45° com coluna reta.',
    stepByStep: [
      'Segure o pegador com braços estendidos e escápulas ativas.',
      'Puxe a carga em direção ao esterno/abdômen superior fechando bem as escápulas.',
      'Desça o peso controladamente até a extensão completa.'
    ],
    breathing: 'Expire na puxada e inspire na descida da carga.',
    commonMistakes: [
      'Arredondar a coluna lombar durante o esforço.',
      'Ficar quase em pé diminuindo a ação dorsal.'
    ],
    safetyTips: [
      'Mantenha o core firme e joelhos semiflexionados para absorver a carga.'
    ],
    defaultSets: 2,
    defaultMinReps: 8,
    defaultMaxReps: 12,
    defaultWeight: 35,
    defaultRestSeconds: 120,
  },
  {
    id: 'hammer_curl',
    name: 'Rosca martelo com cabrestos',
    primaryMuscle: 'Bíceps',
    secondaryMuscles: ['Antebraços'],
    equipment: 'Halteres',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'curl_dumbbell',
    description: 'Flexão de cotovelo em pegada neutra (com halteres ou corda/cabresto) que enfatiza o músculo braquial, braquiorradial e cabeça longa do bíceps.',
    initialPosition: 'Em pé com postura firme, segure os halteres (ou corda na polia) com as palmas das mãos voltadas uma para a outra (pegada neutra).',
    stepByStep: [
      'Mantenha os cotovelos estabilizados ao lado do tronco.',
      'Flexione os cotovelos subindo o peso na linha vertical.',
      'Contraia no topo e desça devagar até estender completamente os braços.'
    ],
    breathing: 'Expire ao subir o peso e inspire ao descer.',
    commonMistakes: [
      'Balançar o quadril para dar impulso à carga.',
      'Levar os cotovelos para a frente no topo do movimento.'
    ],
    safetyTips: [
      'Evite girar os punhos durante a execução para manter o foco no braquial e braquiorradial.'
    ],
    defaultSets: 2,
    defaultMinReps: 10,
    defaultMaxReps: 15,
    defaultWeight: 12,
    defaultRestSeconds: 75,
  },
  {
    id: 'ez_bar_curl',
    name: 'Rosca direta com barra W',
    primaryMuscle: 'Bíceps',
    secondaryMuscles: ['Antebraços'],
    equipment: 'Barras',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'curl_bar',
    description: 'Construtor clássico de volume para o bíceps braquial, utilizando a angulação anatômica da barra W para maior conforto nos punhos.',
    initialPosition: 'Em pé, pés na largura do quadril, segure na curvatura da barra W com pegada supinada e cotovelos encostados nas laterais do tronco.',
    stepByStep: [
      'Suba a barra flexionando apenas os cotovelos em arco.',
      'Contraia fortemente o bíceps na altura do peitoral.',
      'Desça em ritmo controlado resistindo à gravidade.'
    ],
    breathing: 'Expire na subida da barra e inspire na descida.',
    commonMistakes: [
      'Jogar as costas para trás ao iniciar a subida.',
      'Não estender totalmente os braços na parte baixa.'
    ],
    safetyTips: [
      'Contraia glúteos e abdômen para manter a coluna imóvel.'
    ],
    defaultSets: 2,
    defaultMinReps: 10,
    defaultMaxReps: 15,
    defaultWeight: 20,
    defaultRestSeconds: 75,
  },
  {
    id: 'lateral_raise',
    name: 'Elevação lateral',
    primaryMuscle: 'Ombros',
    secondaryMuscles: [],
    equipment: 'Halteres',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'lateral_raise',
    description: 'Exercício indispensável para isolamento da porção lateral (medial) dos deltoides, conferindo largura e estética aos ombros.',
    initialPosition: 'Em pé ou sentado, segure os halteres ao lado do corpo, cotovelos discretamente flexionados e tronco levemente inclinado à frente.',
    stepByStep: [
      'Eleve os braços lateralmente no plano escapular (levemente à frente da linha lateral do tronco).',
      'Suba até os cotovelos atingirem a linha dos ombros.',
      'Desça de forma controlada mantendo tensão contínua no deltoide.'
    ],
    breathing: 'Expire ao elevar os braços e inspire ao descer.',
    commonMistakes: [
      'Encolher os ombros acionando excessivamente o trapézio superior.',
      'Usar carga exagerada e dar impulso com os joelhos.'
    ],
    safetyTips: [
      'Conduza o movimento pelos cotovelos, e não pelas mãos.'
    ],
    defaultSets: 2,
    defaultMinReps: 10,
    defaultMaxReps: 15,
    defaultWeight: 8,
    defaultRestSeconds: 75,
  },

  // =========================================================================
  // SEXTA-FEIRA: OMBROS + ABDÔMEN
  // =========================================================================
  {
    id: 'shoulder_press',
    name: 'Desenvolvimento de ombros',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Tríceps'],
    equipment: 'Halteres',
    type: 'Composto',
    metricMode: 'reps_weight',
    archetype: 'shoulder_press',
    description: 'Movimento composto vertical principal para força e hipertrofia dos deltoides anterior e lateral.',
    initialPosition: 'Sentado em banco com encosto vertical (cerca de 75° a 85°), halteres posicionados na altura das orelhas e antebraços verticais.',
    stepByStep: [
      'Empurre os halteres para cima até quase estender totalmente os cotovelos.',
      'Evite bater os halteres no topo para manter a tensão muscular.',
      'Desça controladamente até os halteres alinharem-se ao queixo/orelhas.'
    ],
    breathing: 'Expire ao empurrar os pesos para cima e inspire na descida.',
    commonMistakes: [
      'Hiperestender a coluna lombar afastando as costas do banco.',
      'Descer pouco e cortar metade da amplitude.'
    ],
    safetyTips: [
      'Posicione os cotovelos levemente à frente da linha dos ombros (plano escapular) para conforto articular.'
    ],
    defaultSets: 2,
    defaultMinReps: 8,
    defaultMaxReps: 12,
    defaultWeight: 14,
    defaultRestSeconds: 90,
  },
  {
    id: 'front_raise',
    name: 'Elevação frontal',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Peito'],
    equipment: 'Halteres',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'front_raise',
    description: 'Isolamento direto para a porção anterior do deltoide com halteres, barra ou cabo.',
    initialPosition: 'Em pé com pés afastados na largura dos ombros, segure os halteres à frente das coxas com pegada pronada ou neutra.',
    stepByStep: [
      'Eleve os braços à frente do corpo até a linha dos olhos/ombros.',
      'Segure uma fração de segundo no topo sem inclinar o tronco para trás.',
      'Desça devagar controlando a fase excêntrica.'
    ],
    breathing: 'Expire ao elevar a carga à frente e inspire na descida.',
    commonMistakes: [
      'Balançar o quadril para lançar os halteres.',
      'Subir muito acima da linha dos ombros.'
    ],
    safetyTips: [
      'Mantenha leve flexão nos cotovelos durante todo o percurso.'
    ],
    defaultSets: 2,
    defaultMinReps: 10,
    defaultMaxReps: 15,
    defaultWeight: 8,
    defaultRestSeconds: 75,
  },
  {
    id: 'reverse_pec_deck',
    name: 'Voador invertido',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Costas'],
    equipment: 'Máquinas',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'reverse_fly',
    description: 'Crucifixo inverso na máquina focado no deltoide posterior, infraespinal, redondo menor e trapézio médio.',
    initialPosition: 'Sente-se de frente para o encosto da máquina Peck Deck, peito apoiado no estofado e mãos segurando as alças na linha dos ombros.',
    stepByStep: [
      'Afaste os braços para trás em arco amplo, mantendo os cotovelos altos.',
      'Foque em mover o úmero para trás sem juntar excessivamente as escápulas no início.',
      'Retorne de forma controlada sem soltar o peso.'
    ],
    breathing: 'Expire ao abrir os braços para trás e inspire ao retornar.',
    commonMistakes: [
      'Abaixar os cotovelos puxando com o grande dorsal.',
      'Desencostar o peito do apoio para dar tranco.'
    ],
    safetyTips: [
      'Ajuste o banco para que as mãos fiquem ligeiramente abaixo da linha dos ombros.'
    ],
    defaultSets: 2,
    defaultMinReps: 10,
    defaultMaxReps: 15,
    defaultWeight: 30,
    defaultRestSeconds: 75,
  },
  {
    id: 'abs_crunch',
    name: 'Abdominal supra (Crunch)',
    primaryMuscle: 'Abdômen',
    secondaryMuscles: [],
    equipment: 'Peso corporal',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'crunch',
    description: 'Flexão torácica controlada no solo ou banco para fortalecimento do reto abdominal.',
    initialPosition: 'Deitado de costas no colchonete, joelhos flexionados, pés apoiados no solo e mãos posicionadas levemente ao lado das têmporas.',
    stepByStep: [
      'Enrole a parte superior do tronco aproximando as costelas da pelve.',
      'Solte todo o ar no topo contraindo fortemente o abdômen.',
      'Desça vértebra por vértebra mantendo tensão abdominal.'
    ],
    breathing: 'Expire completamente ao subir o tronco e inspire ao descer.',
    commonMistakes: [
      'Puxar a cabeça e o pescoço com as mãos.',
      'Subir com a coluna reta usando apenas os flexores do quadril.'
    ],
    safetyTips: [
      'Mantenha um espaço equivalente a uma maçã entre o queixo e o peito.'
    ],
    defaultSets: 2,
    defaultMinReps: 12,
    defaultMaxReps: 20,
    defaultWeight: 0,
    defaultRestSeconds: 60,
  },
  {
    id: 'abs_leg_raise',
    name: 'Abdominal infra (Elevação de pernas)',
    primaryMuscle: 'Abdômen',
    secondaryMuscles: [],
    equipment: 'Peso corporal',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'leg_raise',
    description: 'Trabalho focado na porção inferior do reto abdominal e controle da retroversão pélvica.',
    initialPosition: 'Deitado no solo ou banco, braços estendidos ao lado do corpo para estabilidade e lombar pressionada contra o apoio.',
    stepByStep: [
      'Eleve as pernas unidas e levemente flexionadas até formarem 90° e tire levemente o quadril do solo.',
      'Desça as pernas devagar apenas até onde conseguir manter a lombar colada ao chão.',
      'Evite tocar os pés no chão entre as repetições.'
    ],
    breathing: 'Expire ao subir as pernas/quadril e inspire na descida controlada.',
    commonMistakes: [
      'Deixar a lombar arquear quando as pernas descem.',
      'Usar impulso balístico das pernas.'
    ],
    safetyTips: [
      'Se sentir desconforto lombar, flexione um pouco mais os joelhos.'
    ],
    defaultSets: 2,
    defaultMinReps: 12,
    defaultMaxReps: 20,
    defaultWeight: 0,
    defaultRestSeconds: 60,
  },
  {
    id: 'plank',
    name: 'Prancha',
    primaryMuscle: 'Abdômen',
    secondaryMuscles: ['Corpo inteiro', 'Ombros', 'Glúteos'],
    equipment: 'Peso corporal',
    type: 'Isométrico',
    metricMode: 'duration_seconds',
    archetype: 'plank',
    description: 'Estabilização isométrica profunda para transverso do abdômen, reto abdominal, oblíquos e cintura escapular.',
    initialPosition: 'Apoie os antebraços e as pontas dos pés no solo, cotovelos alinhados exatamente abaixo dos ombros e corpo em linha reta.',
    stepByStep: [
      'Contraia simultaneamente abdômen, glúteos e quadríceps.',
      'Mantenha o alinhamento neutro da cabeça aos calcanhares.',
      'Sustente a posição pelo tempo programado respirando de forma curta e controlada.'
    ],
    breathing: 'Respiração contínua mantendo a parede abdominal firme.',
    commonMistakes: [
      'Deixar o quadril cair sobrecarregando a coluna lombar.',
      'Subir demais o quadril formando uma pirâmide.'
    ],
    safetyTips: [
      'Encerre a série se perceber perda do alinhamento lombar.'
    ],
    defaultSets: 2,
    defaultMinReps: 45,
    defaultMaxReps: 60,
    defaultWeight: 0,
    defaultRestSeconds: 60,
  },

  // =========================================================================
  // SÁBADO: POSTERIOR DE COXA + GLÚTEOS
  // =========================================================================
  {
    id: 'seated_leg_curl',
    name: 'Cadeira flexora',
    primaryMuscle: 'Posterior da coxa',
    secondaryMuscles: ['Panturrilhas'],
    equipment: 'Máquinas',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'leg_curl_seated',
    description: 'Excelente exercício para os isquiotibiais (bíceps femoral, semitendíneo e semimembranáceo) devido ao pré-alongamento na flexão do quadril.',
    initialPosition: 'Sente-se com a coluna apoiada, alinhe o joelho ao eixo da máquina, posicione o rolo acima do calcanhar e trave o apoio superior sobre as coxas.',
    stepByStep: [
      'Flexione os joelhos puxando o rolo para baixo e para trás o máximo possível.',
      'Segure 1 segundo na contração máxima.',
      'Retorne controladamente aproveitando o alongamento completo.'
    ],
    breathing: 'Expire ao flexionar os joelhos e inspire na volta controlada.',
    commonMistakes: [
      'Deixar o trava-coxas frouxo, permitindo que o quadril suba.',
      'Retornar rápido demais perdendo a fase excêntrica.'
    ],
    safetyTips: [
      'Mantenha os tornozelos em leve dorsiflexão (ponta dos pés para cima) para maior ativação.'
    ],
    defaultSets: 2,
    defaultMinReps: 10,
    defaultMaxReps: 15,
    defaultWeight: 45,
    defaultRestSeconds: 90,
  },
  {
    id: 'machine_squat',
    name: 'Agachamento na máquina',
    primaryMuscle: 'Quadríceps',
    secondaryMuscles: ['Glúteos', 'Posterior da coxa'],
    equipment: 'Máquinas',
    type: 'Composto',
    metricMode: 'reps_weight',
    archetype: 'machine_squat',
    description: 'Agachamento guiado (Hack Squat, Pêndulo ou Smith) que proporciona alta estabilidade para focar em glúteos, posterior e quadríceps.',
    initialPosition: 'Apoie as costas e os ombros nos estofados da máquina, posicionando os pés ligeiramente à frente na plataforma para enfatizar glúteos e posterior.',
    stepByStep: [
      'Destrave o aparelho e desça controladamente mantendo a coluna apoiada.',
      'Atinja boa amplitude sem descolar o quadril do encosto.',
      'Empurre a plataforma com força através dos calcanhares.'
    ],
    breathing: 'Inspire na descida e expire ao subir a carga.',
    commonMistakes: [
      'Deixar os calcanhares saírem da plataforma.',
      'Travar os joelhos de forma brusca no topo.'
    ],
    safetyTips: [
      'Posicionar os pés mais altos na plataforma aumenta a exigência sobre glúteos e posteriores.'
    ],
    defaultSets: 2,
    defaultMinReps: 8,
    defaultMaxReps: 12,
    defaultWeight: 70,
    defaultRestSeconds: 120,
  },
  {
    id: 'bulgarian_split_squat',
    name: 'Agachamento búlgaro',
    primaryMuscle: 'Glúteos',
    secondaryMuscles: ['Quadríceps', 'Posterior da coxa'],
    equipment: 'Halteres',
    type: 'Composto',
    metricMode: 'reps_weight',
    archetype: 'bulgarian_squat',
    description: 'Poderoso exercício unilateral que desenvolve glúteo máximo, quadríceps, equilíbrio e corrige assimetrias entre as pernas.',
    initialPosition: 'Em pé de costas para um banco, apoie o peito do pé traseiro no estofado e posicione o pé da frente a uma passada confortável.',
    stepByStep: [
      'Incline levemente o tronco à frente para maior recrutamento do glúteo.',
      'Flexione o joelho da frente descendo o quadril em direção ao solo.',
      'Empurre o chão com o calcanhar da perna da frente até retornar ao topo, depois repita com a outra perna.'
    ],
    breathing: 'Inspire na descida unilateral e expire ao empurrar o solo.',
    commonMistakes: [
      'Fazer força excessiva com a perna apoiada atrás.',
      'Deixar o joelho da frente oscilar para dentro.'
    ],
    safetyTips: [
      'Comece ajustando a distância do pé sem peso antes de segurar os halteres.'
    ],
    defaultSets: 2,
    defaultMinReps: 8,
    defaultMaxReps: 12,
    defaultWeight: 14,
    defaultRestSeconds: 120,
  },
  {
    id: 'lying_leg_curl',
    name: 'Mesa flexora',
    primaryMuscle: 'Posterior da coxa',
    secondaryMuscles: ['Glúteos', 'Panturrilhas'],
    equipment: 'Máquinas',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'leg_curl_lying',
    description: 'Flexão de joelhos em decúbito ventral para fortalecimento e hipertrofia direta dos músculos posteriores da coxa.',
    initialPosition: 'Deite-se de bruços na mesa flexora com os joelhos logo fora da borda do banco e o rolo apoiado na parte posterior dos tornozelos.',
    stepByStep: [
      'Pressione o quadril contra o banco contraindo os glúteos.',
      'Flexione os joelhos levando o rolo em direção aos glúteos.',
      'Segure 1 segundo no topo e desça devagar sem perder a tensão.'
    ],
    breathing: 'Expire ao puxar o rolo e inspire ao estender as pernas.',
    commonMistakes: [
      'Empinar o quadril ao subir a carga, sobrecarregando a lombar.',
      'Soltar a carga rapidamente na metade final.'
    ],
    safetyTips: [
      'Mantenha a pelve sempre colada ao estofado da máquina.'
    ],
    defaultSets: 2,
    defaultMinReps: 10,
    defaultMaxReps: 15,
    defaultWeight: 35,
    defaultRestSeconds: 90,
  },
  {
    id: 'hip_thrust',
    name: 'Elevação pélvica',
    primaryMuscle: 'Glúteos',
    secondaryMuscles: ['Posterior da coxa', 'Abdômen'],
    equipment: 'Barras',
    type: 'Composto',
    metricMode: 'reps_weight',
    archetype: 'hip_thrust',
    description: 'O principal exercício construtor de força e volume para o glúteo máximo, gerando tensão máxima na extensão completa do quadril.',
    initialPosition: 'Apoie a linha inferior das escápulas em um banco firme, posicione a barra acolchoada sobre o quadril e pés afastados na largura dos ombros.',
    stepByStep: [
      'Mantenha o queixo próximo ao peito e o olhar fixo à frente.',
      'Empurre o chão com os calcanhares elevando o quadril até as coxas ficarem paralelas ao solo (joelhos a 90°).',
      'Contraia intensamente os glúteos no topo por 1 a 2 segundos e desça controlando o movimento.'
    ],
    breathing: 'Expire ao estender o quadril e contrair os glúteos; inspire ao descer.',
    commonMistakes: [
      'Hiperestender a lombar em vez de usar os glúteos.',
      'Posicionar os pés muito longe (recruta mais posterior) ou muito perto (recruta mais quadríceps).'
    ],
    safetyTips: [
      'Use sempre espuma protetora (pad) na barra para conforto sobre os ossos ilíacos.'
    ],
    defaultSets: 2,
    defaultMinReps: 8,
    defaultMaxReps: 12,
    defaultWeight: 60,
    defaultRestSeconds: 120,
  },

  // =========================================================================
  // EXERCÍCIOS ADICIONAIS DA BIBLIOTECA COMPLETA (TODAS AS CATEGORIAS E EQUIPAMENTOS)
  // =========================================================================
  // --- ABDÔMEN EXTRAS (Para escolha livre nos slots de Sexta-feira) ---
  {
    id: 'abs_cable_crunch',
    name: 'Abdominal na polia alta (Corda)',
    primaryMuscle: 'Abdômen',
    secondaryMuscles: [],
    equipment: 'Polias',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'crunch',
    description: 'Abdominal com sobrecarga progressiva em polia alta para hipertrofia dos gomos do reto abdominal.',
    initialPosition: 'Ajoelhe-se diante da polia alta segurando a corda ao lado da cabeça com o quadril estabilizado.',
    stepByStep: [
      'Flexione a coluna torácica levando os cotovelos em direção aos joelhos.',
      'Contraia o abdômen expirando todo o ar.',
      'Retorne devagar alongando o reto abdominal.'
    ],
    breathing: 'Expire ao descer enrolando o tronco e inspire ao subir.',
    commonMistakes: ['Sentar nos calcanhares usando o peso do quadril em vez de flexionar a coluna.'],
    safetyTips: ['Mantenha as coxas perpendiculares ao solo durante toda a série.'],
    defaultSets: 2,
    defaultMinReps: 10,
    defaultMaxReps: 15,
    defaultWeight: 30,
    defaultRestSeconds: 60,
  },
  {
    id: 'abs_machine',
    name: 'Abdominal na máquina',
    primaryMuscle: 'Abdômen',
    secondaryMuscles: [],
    equipment: 'Máquinas',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'crunch',
    description: 'Flexão abdominal guiada em máquina com ajuste prático de carga.',
    initialPosition: 'Sentado na máquina de abdômen, segure as alças superiores e apoie os pés nos suportes.',
    stepByStep: [
      'Contraia o abdômen aproximando o peitoral do quadril.',
      'Sustente 1 segundo na contração máxima.',
      'Retorne de forma controlada sem bater as placas.'
    ],
    breathing: 'Expire na flexão do tronco e inspire no retorno.',
    commonMistakes: ['Puxar as alças usando a força dos braços e peitoral.'],
    safetyTips: ['Inicie o movimento pelo encurtamento das costelas.'],
    defaultSets: 2,
    defaultMinReps: 12,
    defaultMaxReps: 15,
    defaultWeight: 30,
    defaultRestSeconds: 60,
  },
  {
    id: 'abs_russian_twist',
    name: 'Abdominal oblíquo (Giro Russo)',
    primaryMuscle: 'Abdômen',
    secondaryMuscles: [],
    equipment: 'Halteres',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'crunch',
    description: 'Rotação controlada do tronco focada nos músculos oblíquos internos e externos.',
    initialPosition: 'Sentado no solo com joelhos semiflexionados e tronco inclinado a 45°, segurando um halter ou anilha junto ao peito.',
    stepByStep: [
      'Gire a caixa torácica levando o peso para o lado direito.',
      'Gire de forma fluida para o lado esquerdo mantendo o abdômen contraído.'
    ],
    breathing: 'Respiração contínua e ritmada a cada rotação.',
    commonMistakes: ['Mover apenas os braços sem girar os ombros e o tórax.'],
    safetyTips: ['Mantenha a coluna alongada sem curvar excessivamente a lombar.'],
    defaultSets: 2,
    defaultMinReps: 12,
    defaultMaxReps: 20,
    defaultWeight: 6,
    defaultRestSeconds: 60,
  },
  {
    id: 'abs_wheel',
    name: 'Abdominal remador / Canivete',
    primaryMuscle: 'Abdômen',
    secondaryMuscles: ['Corpo inteiro'],
    equipment: 'Peso corporal',
    type: 'Composto',
    metricMode: 'reps_weight',
    archetype: 'leg_raise',
    description: 'Flexão combinada de tronco e quadril trabalhando simultaneamente supra e infra abdominal.',
    initialPosition: 'Deitado de costas no solo com braços e pernas totalmente estendidos.',
    stepByStep: [
      'Suba o tronco ao mesmo tempo em que flexiona os joelhos abraçando as canelas.',
      'Retorne à posição estendida com controle.'
    ],
    breathing: 'Expire ao subir fechando o tronco e inspire ao estender.',
    commonMistakes: ['Bater os calcanhares com força no chão.'],
    safetyTips: ['Mantenha o queixo desencostado do esterno.'],
    defaultSets: 2,
    defaultMinReps: 12,
    defaultMaxReps: 15,
    defaultWeight: 0,
    defaultRestSeconds: 60,
  },

  // --- PEITO EXTRAS ---
  {
    id: 'dumbbell_bench_press',
    name: 'Supino reto com halteres',
    primaryMuscle: 'Peito',
    secondaryMuscles: ['Tríceps', 'Ombros'],
    equipment: 'Halteres',
    type: 'Composto',
    metricMode: 'reps_weight',
    archetype: 'flat_press',
    description: 'Versão com halteres que oferece maior amplitude de alongamento e trabalho estabilizador independente para cada braço.',
    initialPosition: 'Deitado no banco reto com um halter em cada mão na linha do peito e escápulas retraídas.',
    stepByStep: [
      'Empurre os halteres para cima convergindo suavemente sem batê-los.',
      'Desça controladamente até os halteres chegarem ao nível do tórax.'
    ],
    breathing: 'Inspire na descida e expire ao empurrar.',
    commonMistakes: ['Bater os halteres no topo perdendo tensão.'],
    safetyTips: ['Use as coxas para impulsionar os halteres ao deitar e ao levantar do banco.'],
    defaultSets: 2,
    defaultMinReps: 8,
    defaultMaxReps: 12,
    defaultWeight: 20,
    defaultRestSeconds: 90,
  },
  {
    id: 'incline_dumbbell_press',
    name: 'Supino inclinado com halteres',
    primaryMuscle: 'Peito',
    secondaryMuscles: ['Ombros', 'Tríceps'],
    equipment: 'Halteres',
    type: 'Composto',
    metricMode: 'reps_weight',
    archetype: 'incline_press',
    description: 'Excelente construtor para o peitoral superior permitindo rotação natural dos punhos e grande amplitude.',
    initialPosition: 'Banco ajustado a 30°–45°, halteres apoiados próximos aos ombros.',
    stepByStep: [
      'Empurre os halteres verticalmente mantendo as escápulas firmes no banco.',
      'Desça alongando bem as fibras superiores do peitoral.'
    ],
    breathing: 'Inspire na descida e expire na subida.',
    commonMistakes: ['Usar banco muito vertical (>60°).'],
    safetyTips: ['Mantenha os cotovelos levemente fechados (cerca de 45°).'],
    defaultSets: 2,
    defaultMinReps: 8,
    defaultMaxReps: 12,
    defaultWeight: 18,
    defaultRestSeconds: 90,
  },
  {
    id: 'push_up',
    name: 'Flexão de braços (Push-up)',
    primaryMuscle: 'Peito',
    secondaryMuscles: ['Tríceps', 'Ombros', 'Abdômen'],
    equipment: 'Peso corporal',
    type: 'Composto',
    metricMode: 'reps_weight',
    archetype: 'pushup',
    description: 'Clássico exercício calistênico de cadeia cinética fechada para peitoral, tríceps e estabilidade do core.',
    initialPosition: 'Mãos apoiadas no solo pouco além da largura dos ombros, corpo alinhado em prancha.',
    stepByStep: [
      'Flexione os cotovelos descendo o peito até próximo ao solo.',
      'Empurre o chão até estender os braços mantendo o tronco reto.'
    ],
    breathing: 'Inspire ao descer e expire ao empurrar.',
    commonMistakes: ['Deixar o quadril cair durante a série.'],
    safetyTips: ['Contraia os glúteos para manter o alinhamento da coluna.'],
    defaultSets: 2,
    defaultMinReps: 10,
    defaultMaxReps: 15,
    defaultWeight: 0,
    defaultRestSeconds: 75,
  },

  // --- COSTAS EXTRAS ---
  {
    id: 'pull_up',
    name: 'Barra fixa (Pull-up)',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps', 'Antebraços', 'Abdômen'],
    equipment: 'Peso corporal',
    type: 'Composto',
    metricMode: 'reps_weight',
    archetype: 'pullup',
    description: 'Exercício calistênico de alto recrutamento para grande dorsal, redondo maior e bíceps.',
    initialPosition: 'Pendurado na barra fixa com pegada pronada mais larga que os ombros.',
    stepByStep: [
      'Deprima as escápulas e puxe o corpo até o queixo ultrapassar a barra.',
      'Desça de forma controlada até estender os braços.'
    ],
    breathing: 'Expire ao subir e inspire ao descer.',
    commonMistakes: ['Balançar as pernas (kipping) sem controle muscular.'],
    safetyTips: ['Evite soltar o peso do corpo bruscamente nos ombros no fundo do movimento.'],
    defaultSets: 2,
    defaultMinReps: 6,
    defaultMaxReps: 12,
    defaultWeight: 0,
    defaultRestSeconds: 120,
  },
  {
    id: 'one_arm_dumbbell_row',
    name: 'Remada unilateral com halter (Serrote)',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps', 'Ombros'],
    equipment: 'Halteres',
    type: 'Composto',
    metricMode: 'reps_weight',
    archetype: 't_bar_row',
    description: 'Trabalho unilateral para o grande dorsal permitindo grande amplitude de alongamento e retração.',
    initialPosition: 'Apoie uma mão e um joelho no banco, coluna paralela ao solo e halter na mão oposta.',
    stepByStep: [
      'Puxe o halter em arco em direção ao quadril (e não ao ombro).',
      'Desça controladamente alongando a escápula.'
    ],
    breathing: 'Expire ao puxar o halter e inspire ao descer.',
    commonMistakes: ['Girar excessivamente o tronco ao puxar a carga.'],
    safetyTips: ['Mantenha o pescoço alinhado ao restante da coluna.'],
    defaultSets: 2,
    defaultMinReps: 8,
    defaultMaxReps: 12,
    defaultWeight: 22,
    defaultRestSeconds: 90,
  },
  {
    id: 'straight_arm_pulldown',
    name: 'Pulldown na polia com corda ou barra',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Tríceps', 'Abdômen'],
    equipment: 'Polias',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'triceps_pushdown',
    description: 'Isolamento puro para o grande dorsal por extensão do ombro sem participação do bíceps.',
    initialPosition: 'Em pé diante da polia alta, tronco inclinado a 30°, braços quase estendidos segurando a barra.',
    stepByStep: [
      'Abaixe a barra em arco até tocar as coxas mantendo os cotovelos fixos.',
      'Retorne até a linha da cabeça sentindo os dorsais alongarem.'
    ],
    breathing: 'Expire ao puxar para baixo e inspire na subida.',
    commonMistakes: ['Dobrar os cotovelos transformando em tríceps polia.'],
    safetyTips: ['Mantenha as escápulas deprimidas.'],
    defaultSets: 2,
    defaultMinReps: 10,
    defaultMaxReps: 15,
    defaultWeight: 20,
    defaultRestSeconds: 75,
  },

  // --- BÍCEPS, TRÍCEPS E ANTEBRAÇOS EXTRAS ---
  {
    id: 'incline_dumbbell_curl',
    name: 'Rosca inclinada com halteres',
    primaryMuscle: 'Bíceps',
    secondaryMuscles: ['Antebraços'],
    equipment: 'Halteres',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'curl_dumbbell',
    description: 'Enfatiza a cabeça longa do bíceps graças à extensão do ombro proporcionada pelo banco inclinado.',
    initialPosition: 'Sentado em banco a 45°–60°, braços pendentes perpendicularmente ao solo.',
    stepByStep: [
      'Flexione os cotovelos mantendo os úmeros fixos para trás.',
      'Desça até o alongamento completo.'
    ],
    breathing: 'Expire ao subir e inspire ao descer.',
    commonMistakes: ['Levar os cotovelos para a frente anulando o alongamento.'],
    safetyTips: ['Use carga moderada para preservar o tendão bicipital.'],
    defaultSets: 2,
    defaultMinReps: 10,
    defaultMaxReps: 15,
    defaultWeight: 10,
    defaultRestSeconds: 75,
  },
  {
    id: 'preacher_curl',
    name: 'Rosca Scott na máquina ou barra',
    primaryMuscle: 'Bíceps',
    secondaryMuscles: ['Antebraços'],
    equipment: 'Máquinas',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'curl_bar',
    description: 'Isolamento rigoroso do bíceps braquial (especialmente cabeça curta) com braços apoiados no banco Scott.',
    initialPosition: 'Ajuste o banco para que as axilas fiquem encaixadas no topo da almofada.',
    stepByStep: [
      'Suba a barra contraindo o bíceps.',
      'Desça devagar até quase estender totalmente os cotovelos.'
    ],
    breathing: 'Expire na subida e inspire na descida.',
    commonMistakes: ['Levantar o corpo do banco na fase excêntrica.'],
    safetyTips: ['Não relaxe os braços de forma abrupta no final da descida.'],
    defaultSets: 2,
    defaultMinReps: 10,
    defaultMaxReps: 15,
    defaultWeight: 25,
    defaultRestSeconds: 75,
  },
  {
    id: 'skull_crusher',
    name: 'Tríceps testa com barra W',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: ['Antebraços'],
    equipment: 'Barras',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'french_press',
    description: 'Extensão de cotovelos deitado trabalhando intensamente as três cabeças do tríceps.',
    initialPosition: 'Deitado no banco reto, segure a barra W acima do peito com braços levemente inclinados para trás.',
    stepByStep: [
      'Flexione os cotovelos descendo a barra em direção à testa ou topo da cabeça.',
      'Estenda os cotovelos retornando à posição inicial.'
    ],
    breathing: 'Inspire ao descer a barra e expire ao estender.',
    commonMistakes: ['Abrir demais os cotovelos para as laterais.'],
    safetyTips: ['Manter uma leve inclinação dos braços para trás mantém tensão contínua no tríceps.'],
    defaultSets: 2,
    defaultMinReps: 10,
    defaultMaxReps: 15,
    defaultWeight: 20,
    defaultRestSeconds: 90,
  },
  {
    id: 'parallel_dips',
    name: 'Mergulho nas paralelas',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: ['Peito', 'Ombros'],
    equipment: 'Peso corporal',
    type: 'Composto',
    metricMode: 'reps_weight',
    archetype: 'dip',
    description: 'Exercício multiarticular potente de cadeia fechada para tríceps e peitoral inferior.',
    initialPosition: 'Sustente o corpo nas barras paralelas com braços estendidos e ombros deprimidos.',
    stepByStep: [
      'Flexione os cotovelos descendo até os braços ficarem paralelos ao solo.',
      'Empurre de volta até estender os cotovelos.'
    ],
    breathing: 'Inspire na descida e expire na subida.',
    commonMistakes: ['Descer além da mobilidade segura dos ombros.'],
    safetyTips: ['Tronco mais vertical foca em tríceps; tronco inclinado à frente foca em peito.'],
    defaultSets: 2,
    defaultMinReps: 8,
    defaultMaxReps: 12,
    defaultWeight: 0,
    defaultRestSeconds: 90,
  },
  {
    id: 'wrist_curl',
    name: 'Rosca de punho com barra ou halter',
    primaryMuscle: 'Antebraços',
    secondaryMuscles: [],
    equipment: 'Barras',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'forearm_curl',
    description: 'Fortalecimento específico para os músculos flexores do antebraço e força de pegada.',
    initialPosition: 'Sentado, apoie os antebraços sobre as coxas ou banco com os punhos livres na borda.',
    stepByStep: [
      'Deixe a barra descer até os dedos e depois flexione os punhos para cima o máximo possível.',
      'Sustente 1 segundo no topo e desça controladamente.'
    ],
    breathing: 'Expire ao subir os punhos e inspire ao descer.',
    commonMistakes: ['Tirar os antebraços do apoio.'],
    safetyTips: ['Priorize repetições altas e movimento fluido sem trancos.'],
    defaultSets: 2,
    defaultMinReps: 12,
    defaultMaxReps: 20,
    defaultWeight: 15,
    defaultRestSeconds: 60,
  },
  {
    id: 'band_face_pull',
    name: 'Face pull com elástico ou polia',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Costas'],
    equipment: 'Elásticos',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'reverse_fly',
    description: 'Excelente exercício postural e preventivo para manguito rotador, deltoide posterior e trapézio.',
    initialPosition: 'Prenda o elástico na altura do rosto e segure as extremidades com os braços estendidos à frente.',
    stepByStep: [
      'Puxe o elástico em direção à testa abrindo os cotovelos e girando os punhos para trás.',
      'Retorne devagar mantendo o controle escapular.'
    ],
    breathing: 'Expire ao puxar e inspire no retorno.',
    commonMistakes: ['Puxar com a lombar inclinada para trás.'],
    safetyTips: ['Foque na rotação externa do ombro no final da puxada.'],
    defaultSets: 2,
    defaultMinReps: 12,
    defaultMaxReps: 15,
    defaultWeight: 10,
    defaultRestSeconds: 60,
  },

  // --- PERNAS, GLÚTEOS, PANTURRILHAS E CORPO INTEIRO EXTRAS ---
  {
    id: 'romanian_deadlift',
    name: 'Stiff / Levantamento terra romeno',
    primaryMuscle: 'Posterior da coxa',
    secondaryMuscles: ['Glúteos', 'Costas'],
    equipment: 'Barras',
    type: 'Composto',
    metricMode: 'reps_weight',
    archetype: 'deadlift',
    description: 'Padrão de dobradiça de quadril (hip hinge) essencial para hipertrofia dos isquiotibiais e glúteos em alongamento.',
    initialPosition: 'Em pé segurando a barra próxima às coxas, pés na largura do quadril e joelhos destravados.',
    stepByStep: [
      'Projete o quadril para trás mantendo a barra colada às pernas e a coluna neutra.',
      'Desça até sentir forte alongamento nos posteriores (geralmente meia canela).',
      'Estenda o quadril contraindo os glúteos para retornar.'
    ],
    breathing: 'Inspire ao descer o tronco e expire ao subir.',
    commonMistakes: ['Arredondar a coluna lombar tentando tocar a barra no chão.'],
    safetyTips: ['A amplitude termina quando o quadril para de ir para trás.'],
    defaultSets: 2,
    defaultMinReps: 8,
    defaultMaxReps: 12,
    defaultWeight: 50,
    defaultRestSeconds: 120,
  },
  {
    id: 'walking_lunge',
    name: 'Afundo / Passada com halteres',
    primaryMuscle: 'Quadríceps',
    secondaryMuscles: ['Glúteos', 'Posterior da coxa'],
    equipment: 'Halteres',
    type: 'Composto',
    metricMode: 'reps_weight',
    archetype: 'lunge',
    description: 'Movimento unilateral dinâmico para quadríceps e glúteos.',
    initialPosition: 'Em pé segurando um par de halteres ao lado do corpo.',
    stepByStep: [
      'Dê um passo à frente e flexione ambos os joelhos a cerca de 90°.',
      'Empurre o solo com a perna da frente retornando ou avançando para a próxima passada.'
    ],
    breathing: 'Inspire ao descer e expire ao subir.',
    commonMistakes: ['Bater o joelho de trás com força no chão.'],
    safetyTips: ['Mantenha os pés afastados na largura do quadril (como em trilhos de trem) para equilíbrio.'],
    defaultSets: 2,
    defaultMinReps: 10,
    defaultMaxReps: 12,
    defaultWeight: 12,
    defaultRestSeconds: 90,
  },
  {
    id: 'hip_adduction',
    name: 'Cadeira adutora',
    primaryMuscle: 'Quadríceps',
    secondaryMuscles: ['Glúteos'],
    equipment: 'Máquinas',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'abduction',
    description: 'Fortalecimento direto dos músculos adutores (parte interna da coxa).',
    initialPosition: 'Sentado na máquina com os apoios posicionados na face interna dos joelhos.',
    stepByStep: [
      'Feche as pernas controladamente até aproximar os apoios.',
      'Segure 1 segundo e abra as pernas devagar até um alongamento seguro.'
    ],
    breathing: 'Expire ao fechar as pernas e inspire ao abrir.',
    commonMistakes: ['Soltar a trava em amplitude exagerada sem aquecimento prévio.'],
    safetyTips: ['Aumente a amplitude gradualmente ao longo das séries.'],
    defaultSets: 2,
    defaultMinReps: 10,
    defaultMaxReps: 15,
    defaultWeight: 40,
    defaultRestSeconds: 75,
  },
  {
    id: 'standing_calf_raise',
    name: 'Panturrilha em pé na máquina',
    primaryMuscle: 'Panturrilhas',
    secondaryMuscles: [],
    equipment: 'Máquinas',
    type: 'Isolado',
    metricMode: 'reps_weight',
    archetype: 'calf_raise',
    description: 'Com os joelhos estendidos, enfatiza de forma máxima as cabeças medial e lateral do gastrocnêmio.',
    initialPosition: 'Ombros sob as almofadas da máquina, pontas dos pés na plataforma e joelhos estendidos (sem hiperestender).',
    stepByStep: [
      'Desça os calcanhares alongando toda a panturrilha.',
      'Suba o máximo possível na ponta dos pés e segure 1 segundo.'
    ],
    breathing: 'Expire na subida e inspire na descida.',
    commonMistakes: ['Flexionar os joelhos para roubar com o quadríceps.'],
    safetyTips: ['Mantenha o core firme para proteger a coluna sob as almofadas.'],
    defaultSets: 2,
    defaultMinReps: 12,
    defaultMaxReps: 20,
    defaultWeight: 50,
    defaultRestSeconds: 60,
  },
  {
    id: 'treadmill_run',
    name: 'Esteira ergométrica (Caminhada / Corrida)',
    primaryMuscle: 'Cardio',
    secondaryMuscles: ['Quadríceps', 'Panturrilhas', 'Corpo inteiro'],
    equipment: 'Equipamentos cardiovasculares',
    type: 'Cardio',
    metricMode: 'duration_minutes',
    archetype: 'treadmill',
    description: 'Treino cardiovascular em esteira para condicionamento aeróbico e gasto calórico.',
    initialPosition: 'Posicione-se no centro da lona da esteira com postura ereta e olhar à frente.',
    stepByStep: [
      'Inicie com caminhada leve por 2 a 3 minutos.',
      'Ajuste a velocidade e inclinação conforme seu objetivo.',
      'Reduza a velocidade gradualmente antes de desligar.'
    ],
    breathing: 'Respiração cadenciada e constante.',
    commonMistakes: ['Segurar continuamente nos apoios frontais enquanto corre.'],
    safetyTips: ['Utilize o clipe de parada de emergência quando treinar em velocidades altas.'],
    defaultSets: 1,
    defaultMinReps: 20,
    defaultMaxReps: 20,
    defaultWeight: 0,
    defaultRestSeconds: 60,
  },
  {
    id: 'conventional_deadlift',
    name: 'Levantamento terra tradicional',
    primaryMuscle: 'Corpo inteiro',
    secondaryMuscles: ['Posterior da coxa', 'Glúteos', 'Costas', 'Antebraços'],
    equipment: 'Barras',
    type: 'Composto',
    metricMode: 'reps_weight',
    archetype: 'deadlift',
    description: 'Exercício de força global que recruta toda a cadeia posterior, core, dorsais e membros inferiores.',
    initialPosition: 'Barra sobre o meio dos pés, canelas próximas à barra, coluna neutra e peito alto.',
    stepByStep: [
      'Tire a folga da barra ativando os dorsais.',
      'Empurre o chão com as pernas enquanto estende o quadril até ficar totalmente ereto.',
      'Desça a barra guiando-a próxima às coxas e canelas.'
    ],
    breathing: 'Inspire profundamente antes de tirar a barra do solo e expire no topo.',
    commonMistakes: ['Deixar a barra afastar-se do corpo durante a subida.'],
    safetyTips: ['Nunca inicie a puxada com a lombar arredondada.'],
    defaultSets: 2,
    defaultMinReps: 6,
    defaultMaxReps: 10,
    defaultWeight: 70,
    defaultRestSeconds: 150,
  },
  {
    id: 'kettlebell_thruster',
    name: 'Agachamento com desenvolvimento (Thruster)',
    primaryMuscle: 'Corpo inteiro',
    secondaryMuscles: ['Quadríceps', 'Ombros', 'Glúteos', 'Abdômen'],
    equipment: 'Halteres',
    type: 'Composto',
    metricMode: 'reps_weight',
    archetype: 'full_body',
    description: 'Movimento integrado de corpo inteiro que combina agachamento frontal e desenvolvimento de ombros.',
    initialPosition: 'Segure os halteres na altura dos ombros com pés afastados na largura dos ombros.',
    stepByStep: [
      'Realize um agachamento completo mantendo o tronco firme.',
      'Use o impulso da subida do agachamento para desenvolver os halteres acima da cabeça.'
    ],
    breathing: 'Inspire ao agachar e expire ao empurrar os pesos acima da cabeça.',
    commonMistakes: ['Empurrar os halteres antes de terminar a extensão do quadril.'],
    safetyTips: ['Mantenha os cotovelos altos durante a fase de agachamento.'],
    defaultSets: 2,
    defaultMinReps: 8,
    defaultMaxReps: 12,
    defaultWeight: 12,
    defaultRestSeconds: 90,
  },
];
