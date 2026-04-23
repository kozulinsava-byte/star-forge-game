// ========== КОНФИГУРАЦИЯ ИГРЫ STAR FORGE ==========
// В этом файле хранятся ВСЕ данные о предметах, локациях и жеодах.
// Чтобы добавить новый слиток, просто добавь новый объект в соответствующий массив.

// ---------- СЛИТКИ (INGOTS) ----------
export const CONFIG_ITEMS = {
    // ===== ШАХТЫ (ОБЫЧНЫЕ) =====
    copper: {
        id: 'copper',
        name: 'Медь',
        icon: '🟫',
        rarity: 'Обычный',
        rarityClass: 'common',
        glowClass: 'glow-copper',
        location: 'mine',
        description: 'Фундаментальный металл цивилизации. Медь используется в электропроводке всех космических кораблей. Её теплый блеск символизирует начало великого пути коллекционера. В древности медь ценилась на вес золота, и сегодня она остаётся критически важным ресурсом для колонизации дальних миров.',
        imagePath: 'assets/ingots/copper.png',
        fallbackColor: '#B87333',
        isCollectible: false,
        xpValue: 5,
        sellValue: 5
    },
    iron: {
        id: 'iron',
        name: 'Железо',
        icon: '⬜️',
        rarity: 'Обычный',
        rarityClass: 'common',
        glowClass: 'glow-iron',
        location: 'mine',
        description: 'Основа промышленности. Железо — это скелет космических станций и каркас межзвёздных крейсеров. Его добывают в недрах планет, где оно формировалось миллиарды лет. Несмотря на кажущуюся простоту, без железа невозможна экспансия человечества в глубокий космос. Каждый слиток — вклад в будущее.',
        imagePath: 'assets/ingots/iron.png',
        fallbackColor: '#A8A9AD',
        isCollectible: false,
        xpValue: 5,
        sellValue: 5
    },
    coal: {
        id: 'coal',
        name: 'Угольный брикет',
        icon: '⬛',
        rarity: 'Обычный',
        rarityClass: 'common',
        glowClass: 'glow-copper',
        location: 'mine',
        description: 'Спрессованная энергия древних лесов. Уголь — это не просто топливо, это память планеты. В условиях космоса угольные брикеты используются в системах фильтрации и как сырьё для синтеза наноматериалов. Его матовая чернота скрывает потенциал, который раскрывается лишь при сверхвысоких температурах.',
        imagePath: 'assets/ingots/coal.png',
        fallbackColor: '#2C2C2E',
        isCollectible: false,
        xpValue: 4,
        sellValue: 4
    },
    tin: {
        id: 'tin',
        name: 'Олово',
        icon: '🔘',
        rarity: 'Обычный',
        rarityClass: 'common',
        glowClass: 'glow-iron',
        location: 'mine',
        description: 'Мягкий, но стратегически важный металл. Олово незаменимо для создания припоев и сплавов, устойчивых к коррозии. На космических верфях оловянные соединения защищают критически важные узлы от разрушения. Его серебристый отлив напоминает о холодном свете далёких лун.',
        imagePath: 'assets/ingots/tin.png',
        fallbackColor: '#C0C0C0',
        isCollectible: false,
        xpValue: 5,
        sellValue: 5
    },
    nickel: {
        id: 'nickel',
        name: 'Никель',
        icon: '🔩',
        rarity: 'Обычный',
        rarityClass: 'common',
        glowClass: 'glow-iron',
        location: 'mine',
        description: 'Ключевой компонент нержавеющей стали и суперсплавов. Никель придаёт металлам прочность и устойчивость к экстремальным температурам. Его часто находят в метеоритах, что делает его мостом между геологией планет и тайнами космоса. Каждый слиток никеля — это шаг к созданию неуязвимых кораблей.',
        imagePath: 'assets/ingots/nickel.png',
        fallbackColor: '#A0A0A0',
        isCollectible: false,
        xpValue: 6,
        sellValue: 6
    },
    lead: {
        id: 'lead',
        name: 'Свинец',
        icon: '🔘',
        rarity: 'Обычный',
        rarityClass: 'common',
        glowClass: 'glow-iron',
        location: 'mine',
        description: 'Тяжёлый и надёжный защитник. Свинец используется для экранирования от радиации в ядерных реакторах и космических скафандрах. Его плотная структура поглощает смертоносные лучи, позволяя исследовать самые опасные уголки галактики. Мрачный блеск свинца — это обещание безопасности.',
        imagePath: 'assets/ingots/lead.png',
        fallbackColor: '#6B6B6B',
        isCollectible: false,
        xpValue: 5,
        sellValue: 5
    },

    // ===== ДЖУНГЛИ (ОБЫЧНЫЕ) =====
    biocopper: {
        id: 'biocopper',
        name: 'Био-медь',
        icon: '🧪',
        rarity: 'Редкий',
        rarityClass: 'rare',
        glowClass: 'glow-gold',
        location: 'jungle',
        description: 'Удивительный сплав, созданный симбиозом меди и микроорганизмов джунглей. Био-медь обладает способностью к самовосстановлению при подаче слабого электричества. Её зеленоватое свечение указывает на активные биологические процессы внутри. Это материал будущего для самовосстанавливающихся кораблей.',
        imagePath: 'assets/ingots/biocopper.png',
        fallbackColor: '#4CAF50',
        isCollectible: false,
        xpValue: 15,
        sellValue: 15
    },
    oxidizedsilver: {
        id: 'oxidizedsilver',
        name: 'Окисленное серебро',
        icon: '🥈',
        rarity: 'Редкий',
        rarityClass: 'rare',
        glowClass: 'glow-platinum',
        location: 'jungle',
        description: 'Серебро, веками лежавшее во влажных недрах джунглей. Оксидная плёнка придаёт ему радужные переливы и уникальные антибактериальные свойства. В медицине дальнего космоса такие слитки ценятся выше чистого серебра, так как их поверхность стерильна и ускоряет заживление ран.',
        imagePath: 'assets/ingots/oxidizedsilver.png',
        fallbackColor: '#C0C0C0',
        isCollectible: false,
        xpValue: 18,
        sellValue: 18
    },
    emeraldsteel: {
        id: 'emeraldsteel',
        name: 'Изумрудная сталь',
        icon: '💚',
        rarity: 'Эпический',
        rarityClass: 'epic',
        glowClass: 'glow-platinum',
        location: 'jungle',
        description: 'Легендарный сплав, в кристаллической решётке которого содержатся атомы изумруда. Изумрудная сталь невероятно острая и никогда не тупится. Клинки из неё способны разрезать даже композитную броню. Её зелёное сияние — признак высочайшего мастерства древних кузнецов джунглей.',
        imagePath: 'assets/ingots/emeraldsteel.png',
        fallbackColor: '#50C878',
        isCollectible: false,
        xpValue: 35,
        sellValue: 35
    },
    woodalloy: {
        id: 'woodalloy',
        name: 'Древесный сплав',
        icon: '🪵',
        rarity: 'Редкий',
        rarityClass: 'rare',
        glowClass: 'glow-gold',
        location: 'jungle',
        description: 'Уникальный композит, сочетающий прочность металла и лёгкость дерева. Создаётся путём пропитки особых пород деревьев расплавленными минералами. Древесный сплав используется для создания эргономичных деталей интерьера премиальных яхт и орбитальных станций.',
        imagePath: 'assets/ingots/woodalloy.png',
        fallbackColor: '#8B4513',
        isCollectible: false,
        xpValue: 20,
        sellValue: 20
    },
    vinebronze: {
        id: 'vinebronze',
        name: 'Лиановая бронза',
        icon: '🌿',
        rarity: 'Редкий',
        rarityClass: 'rare',
        glowClass: 'glow-gold',
        location: 'jungle',
        description: 'Бронза, армированная волокнами космических лиан. Эти лианы способны выдерживать перепады давления и температур, делая сплав идеальным для внешней обшивки кораблей, садящихся на планеты с агрессивной атмосферой. Её коричневато-зелёный оттенок напоминает о буйстве жизни.',
        imagePath: 'assets/ingots/vinebronze.png',
        fallbackColor: '#CD7F32',
        isCollectible: false,
        xpValue: 22,
        sellValue: 22
    },

    // ===== АСТЕРОИДЫ (ОБЫЧНЫЕ) =====
    titanium: {
        id: 'titanium',
        name: 'Титан',
        icon: '🔷',
        rarity: 'Эпический',
        rarityClass: 'epic',
        glowClass: 'glow-platinum',
        location: 'asteroid',
        description: 'Бог среди металлов. Титан сочетает невероятную прочность с поразительной лёгкостью. Из него строят каркасы звездолётов, способных выходить в гиперпространство. Добыча титана в поясе астероидов — опасное, но крайне прибыльное занятие. Его холодный синий блеск вселяет уверенность.',
        imagePath: 'assets/ingots/titanium.png',
        fallbackColor: '#5A9CFF',
        isCollectible: false,
        xpValue: 40,
        sellValue: 40
    },
    cobalt: {
        id: 'cobalt',
        name: 'Кобальт',
        icon: '🔵',
        rarity: 'Редкий',
        rarityClass: 'rare',
        glowClass: 'glow-gold',
        location: 'asteroid',
        description: 'Стратегический металл для производства аккумуляторов и жаропрочных сплавов. Кобальт из астероидов отличается исключительной чистотой и используется в реакторах военных крейсеров. Его глубокий синий цвет символизирует бескрайние глубины космоса, откуда он прибыл.',
        imagePath: 'assets/ingots/cobalt.png',
        fallbackColor: '#0047AB',
        isCollectible: false,
        xpValue: 25,
        sellValue: 25
    },
    iridium: {
        id: 'iridium',
        name: 'Иридиевый стержень',
        icon: '💠',
        rarity: 'Легендарный',
        rarityClass: 'legendary',
        glowClass: 'glow-diamond',
        location: 'asteroid',
        description: 'Один из самых редких и плотных металлов во вселенной. Иридий невероятно устойчив к коррозии и высоким температурам. Из него изготавливают сердечники варп-двигателей и защитные купола для колоний на вулканических планетах. Владеть иридием — значит владеть частицей вечности.',
        imagePath: 'assets/ingots/iridium.png',
        fallbackColor: '#E5E4E2',
        isCollectible: false,
        xpValue: 60,
        sellValue: 60
    },
    platincon: {
        id: 'platincon',
        name: 'Платиновый концентрат',
        icon: '💎',
        rarity: 'Эпический',
        rarityClass: 'epic',
        glowClass: 'glow-platinum',
        location: 'asteroid',
        description: 'Высококонцентрированная платиновая руда, прошедшая первичную обработку прямо в невесомости. Содержит не только платину, но и редкоземельные элементы. Концентрат ценится ювелирами и инженерами за возможность создавать уникальные сплавы с заданными свойствами.',
        imagePath: 'assets/ingots/platincon.png',
        fallbackColor: '#E5E4E2',
        isCollectible: false,
        xpValue: 45,
        sellValue: 45
    },
    lunarsilver: {
        id: 'lunarsilver',
        name: 'Лунное серебро',
        icon: '🌙',
        rarity: 'Редкий',
        rarityClass: 'rare',
        glowClass: 'glow-gold',
        location: 'asteroid',
        description: 'Серебро, миллиарды лет облучавшееся космическими лучами. Приобрело уникальный молочный оттенок и слабые люминесцентные свойства. Лунное серебро используется в точной оптике и для создания зеркал телескопов, заглядывающих в самые далёкие галактики.',
        imagePath: 'assets/ingots/lunarsilver.png',
        fallbackColor: '#F5F5DC',
        isCollectible: false,
        xpValue: 28,
        sellValue: 28
    },
    starchrome: {
        id: 'starchrome',
        name: 'Звёздный хром',
        icon: '⭐',
        rarity: 'Эпический',
        rarityClass: 'epic',
        glowClass: 'glow-platinum',
        location: 'asteroid',
        description: 'Хром, добытый из осколков сверхновых. Его поверхность переливается всеми цветами радуги благодаря микроскопическим вкраплениям других элементов. Звёздный хром — излюбленный материал дизайнеров для создания эксклюзивных корпусов личных звездолётов. Это металл, рождённый в огне.',
        imagePath: 'assets/ingots/starchrome.png',
        fallbackColor: '#C0C0C0',
        isCollectible: false,
        xpValue: 38,
        sellValue: 38
    },

    // ===== КОЛЛЕКЦИОННЫЕ АРТЕФАКТЫ (COLLECTIBLE) =====
    isotope: {
        id: 'isotope',
        name: 'Изотоп-256',
        icon: '☢️',
        rarity: 'COLLECTIBLE',
        rarityClass: 'collectible',
        glowClass: 'glow-isotope',
        location: 'mine',
        description: 'Древняя легенда шахтёров. Говорят, Изотоп-256 — это осколок давно погасшей звезды, упавший в недра планеты миллионы лет назад. Его радиоактивное мерцание гипнотизирует. Учёные до сих пор спорят о его происхождении, но сходятся в одном: второго такого артефакта во всей галактике не существует. Он пульсирует в такт вращению далёких квазаров, напоминая о бренности всего сущего и величии космоса. Тот, кто держит его в руках, чувствует необъяснимую связь со вселенной.',
        imagePath: 'assets/ingots/isotope.png',
        fallbackColor: '#00FFC8',
        isCollectible: true,
        xpValue: 300,
        sellValue: 500
    },
    osmium: {
        id: 'osmium',
        name: 'Древний Осмий',
        icon: '🪨',
        rarity: 'COLLECTIBLE',
        rarityClass: 'collectible',
        glowClass: 'glow-osmium',
        location: 'mine',
        description: 'Самый плотный природный элемент во вселенной. Этот осмий старше самой Солнечной системы. Он прибыл к нам из глубин Млечного Пути, пережив рождение и смерть десятков звёзд. Его тяжесть поражает — небольшой слиток весит как массивный кусок железа. Говорят, в древности его использовали исчезнувшие цивилизации для создания якорей реальности, удерживающих планеты на орбитах. Прикоснуться к нему — значит прикоснуться к вечности.',
        imagePath: 'assets/ingots/osmium.png',
        fallbackColor: '#9664FF',
        isCollectible: true,
        xpValue: 300,
        sellValue: 500
    },
    biosteel: {
        id: 'biosteel',
        name: 'Био-Сталь',
        icon: '🧬',
        rarity: 'COLLECTIBLE',
        rarityClass: 'collectible',
        glowClass: 'glow-biosteel',
        location: 'jungle',
        description: 'Венец эволюции органических металлов. Био-Сталь — это не просто материал, это симбионт. Она растёт, дышит и даже способна к примитивной регенерации, если её подпитывать энергией. Обнаруженная в сердце древнего леса, эта субстанция перевернула представления ксенобиологов о возможностях жизни. Слиток Био-Стали тёплый на ощупь и едва заметно вибрирует, словно живое сердце. Говорят, она может адаптироваться к своему владельцу, становясь твёрже или гибче по его желанию.',
        imagePath: 'assets/ingots/biosteel.png',
        fallbackColor: '#32C864',
        isCollectible: true,
        xpValue: 400,
        sellValue: 700
    },
    relicbronze: {
        id: 'relicbronze',
        name: 'Реликтовая Бронза',
        icon: '🏺',
        rarity: 'COLLECTIBLE',
        rarityClass: 'collectible',
        glowClass: 'glow-relicbronze',
        location: 'jungle',
        description: 'Сплав, созданный не человеческими руками. На его поверхности выгравированы символы, не поддающиеся расшифровке лучшими лингвистами и ИИ. Радиоуглеродный анализ показывает возраст в десятки миллионов лет. Как бронза могла сохраниться так долго? Учёные предполагают, что она была создана расой, существовавшей ещё до динозавров. Реликтовая Бронза не поддаётся никаким современным инструментам — её нельзя расплавить, разрезать или поцарапать. Это послание из прошлого, которое мы пока не в силах прочесть.',
        imagePath: 'assets/ingots/relicbronze.png',
        fallbackColor: '#C87832',
        isCollectible: true,
        xpValue: 400,
        sellValue: 700
    },
    tungsten: {
        id: 'tungsten',
        name: 'Звёздный Вольфрам',
        icon: '⭐',
        rarity: 'COLLECTIBLE',
        rarityClass: 'collectible',
        glowClass: 'glow-tungsten',
        location: 'asteroid',
        description: 'Металл, прошедший горнило сверхновой. Звёздный Вольфрам имеет самую высокую температуру плавления среди всех известных веществ. Его кристаллическая решётка искажена чудовищными гравитационными полями, что придаёт ему уникальные свойства. Он способен накапливать и высвобождать огромное количество энергии. Легенды гласят, что первый такой слиток был найден в кратере от падения астероида, уничтожившего динозавров. Тот, кто сможет обуздать его мощь, получит доступ к неисчерпаемому источнику энергии.',
        imagePath: 'assets/ingots/tungsten.png',
        fallbackColor: '#6496FF',
        isCollectible: true,
        xpValue: 500,
        sellValue: 900
    },
    darkmatter: {
        id: 'darkmatter',
        name: 'Тёмная Материя',
        icon: '🌑',
        rarity: 'COLLECTIBLE',
        rarityClass: 'collectible',
        glowClass: 'glow-darkmatter',
        location: 'asteroid',
        description: 'Это не просто слиток. Это стабилизированный сгусток невидимой субстанции, из которой состоит большая часть Вселенной. Тёмная Материя не взаимодействует со светом, но её гравитационное влияние колоссально. Держать её в руках — странное чувство: ты ощущаешь вес, но не видишь чётких границ. Слиток кажется бездонной чернотой, поглощающей любой свет. Учёные предполагают, что это ключ к пониманию структуры мироздания и, возможно, к путешествиям между галактиками. Артефакт уровня богов.',
        imagePath: 'assets/ingots/darkmatter.png',
        fallbackColor: '#B400FF',
        isCollectible: true,
        xpValue: 500,
        sellValue: 900
    }
};

// ---------- ЖЕОДЫ (GEODES) ----------
export const CONFIG_GEODES = {
    // Обычные жеоды
    mine: {
        id: 'mine',
        name: 'Жеода Шахт',
        icon: '🪨',
        isSpecial: false,
        timer: 30,
        description: 'Глубинная порода, хранящая тепло земных недр. Внутри могут скрываться базовые, но достойные металлы.',
        stages: [
            { minTaps: 7, maxTaps: 10, imagePath: 'assets/geodes/mine_stage1.png', fallbackIcon: '🪨' },
            { minTaps: 3, maxTaps: 6, imagePath: 'assets/geodes/mine_stage2.png', fallbackIcon: '💔' },
            { minTaps: 1, maxTaps: 2, imagePath: 'assets/geodes/mine_stage3.png', fallbackIcon: '💥' }
        ],
        lootTable: [
            { ingotId: 'copper', chance: 0.30 },
            { ingotId: 'iron', chance: 0.25 },
            { ingotId: 'coal', chance: 0.15 },
            { ingotId: 'tin', chance: 0.10 },
            { ingotId: 'nickel', chance: 0.10 },
            { ingotId: 'lead', chance: 0.10 }
        ],
        xpValue: 10
    },
    jungle: {
        id: 'jungle',
        name: 'Жеода Джунглей',
        icon: '🌲',
        isSpecial: false,
        timer: 300,
        description: 'Таинственная жеода, пропитанная энергией древних лесов. Шанс обнаружить драгоценные металлы значительно выше.',
        stages: [
            { minTaps: 7, maxTaps: 10, imagePath: 'assets/geodes/jungle_stage1.png', fallbackIcon: '🌲' },
            { minTaps: 3, maxTaps: 6, imagePath: 'assets/geodes/jungle_stage2.png', fallbackIcon: '🍂' },
            { minTaps: 1, maxTaps: 2, imagePath: 'assets/geodes/jungle_stage3.png', fallbackIcon: '🪵' }
        ],
        lootTable: [
            { ingotId: 'biocopper', chance: 0.20 },
            { ingotId: 'oxidizedsilver', chance: 0.20 },
            { ingotId: 'emeraldsteel', chance: 0.15 },
            { ingotId: 'woodalloy', chance: 0.20 },
            { ingotId: 'vinebronze', chance: 0.25 }
        ],
        xpValue: 20
    },
    asteroid: {
        id: 'asteroid',
        name: 'Жеода Астероидов',
        icon: '🌌',
        isSpecial: false,
        timer: 1200,
        description: 'Космический артефакт, прилетевший из пояса астероидов. Внутри — высокая концентрация редчайших элементов.',
        stages: [
            { minTaps: 7, maxTaps: 10, imagePath: 'assets/geodes/asteroid_stage1.png', fallbackIcon: '🌌' },
            { minTaps: 3, maxTaps: 6, imagePath: 'assets/geodes/asteroid_stage2.png', fallbackIcon: '☄️' },
            { minTaps: 1, maxTaps: 2, imagePath: 'assets/geodes/asteroid_stage3.png', fallbackIcon: '💫' }
        ],
        lootTable: [
            { ingotId: 'titanium', chance: 0.20 },
            { ingotId: 'cobalt', chance: 0.15 },
            { ingotId: 'iridium', chance: 0.10 },
            { ingotId: 'platincon', chance: 0.20 },
            { ingotId: 'lunarsilver', chance: 0.15 },
            { ingotId: 'starchrome', chance: 0.20 }
        ],
        xpValue: 40
    },

    // Особые жеоды (для коллекционных артефактов)
    special_mine: {
        id: 'special_mine',
        name: 'Реликтовая Руда',
        icon: '💠',
        isSpecial: true,
        location: 'mine',
        timer: 45,
        description: 'Древняя руда, пульсирующая энергией. Гарантированно содержит уникальный артефакт Шахт.',
        stages: [
            { minTaps: 7, maxTaps: 10, imagePath: 'assets/geodes/special_mine_stage1.png', fallbackIcon: '💠' },
            { minTaps: 3, maxTaps: 6, imagePath: 'assets/geodes/special_mine_stage2.png', fallbackIcon: '🔶' },
            { minTaps: 1, maxTaps: 2, imagePath: 'assets/geodes/special_mine_stage3.png', fallbackIcon: '🔸' }
        ],
        possibleIngots: ['isotope', 'osmium'],
        xpValue: 100
    },
    special_jungle: {
        id: 'special_jungle',
        name: 'Окисленный Сплав',
        icon: '🧪',
        isSpecial: true,
        location: 'jungle',
        timer: 450,
        description: 'Сплав, созданный природой за миллионы лет. Скрывает артефакты Джунглей.',
        stages: [
            { minTaps: 7, maxTaps: 10, imagePath: 'assets/geodes/special_jungle_stage1.png', fallbackIcon: '🧪' },
            { minTaps: 3, maxTaps: 6, imagePath: 'assets/geodes/special_jungle_stage2.png', fallbackIcon: '🧫' },
            { minTaps: 1, maxTaps: 2, imagePath: 'assets/geodes/special_jungle_stage3.png', fallbackIcon: '⚗️' }
        ],
        possibleIngots: ['biosteel', 'relicbronze'],
        xpValue: 150
    },
    special_asteroid: {
        id: 'special_asteroid',
        name: 'Метеоритное Ядро',
        icon: '☄️',
        isSpecial: true,
        location: 'asteroid',
        timer: 1800,
        description: 'Ядро древнего метеорита. Хранит в себе тайны космоса.',
        stages: [
            { minTaps: 7, maxTaps: 10, imagePath: 'assets/geodes/special_asteroid_stage1.png', fallbackIcon: '☄️' },
            { minTaps: 3, maxTaps: 6, imagePath: 'assets/geodes/special_asteroid_stage2.png', fallbackIcon: '🌠' },
            { minTaps: 1, maxTaps: 2, imagePath: 'assets/geodes/special_asteroid_stage3.png', fallbackIcon: '💫' }
        ],
        possibleIngots: ['tungsten', 'darkmatter'],
        xpValue: 200
    }
};

// ---------- ЛОКАЦИИ (EXPEDITIONS) ----------
export const CONFIG_EXPEDITIONS = {
    mine: {
        id: 'mine',
        name: 'Шахты',
        description: 'Глубинная разработка в коре планеты. Стабильный источник обычных жеод и редкой Реликтовой Руды.',
        imagePath: 'assets/expeditions/mine.png',
        fallbackIcon: '⛏️',
        timer: 30,
        requiredLevel: 1,
        specialGeodeChance: 0.10,
        specialGeodeId: 'special_mine'
    },
    jungle: {
        id: 'jungle',
        name: 'Джунгли',
        description: 'Опасные, но богатые заросли. Высокий шанс найти редкие жеоды и Окисленный Сплав.',
        imagePath: 'assets/expeditions/jungle.png',
        fallbackIcon: '🌴',
        timer: 300,
        requiredLevel: 5,
        specialGeodeChance: 0.15,
        specialGeodeId: 'special_jungle'
    },
    asteroid: {
        id: 'asteroid',
        name: 'Пояс Астероидов',
        description: 'Экстремальная экспедиция в открытый космос. Только здесь можно найти эпические жеоды и Метеоритное Ядро.',
        imagePath: 'assets/expeditions/asteroid.png',
        fallbackIcon: '🪐',
        timer: 1200,
        requiredLevel: 10,
        specialGeodeChance: 0.25,
        specialGeodeId: 'special_asteroid'
    }
};

// ---------- УРОВНИ И СТАТУСЫ ----------
export const LEVELS = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3300, 4000, 4800, 5700, 6700, 7800, 9000, 10300, 11700, 13200, 15000];
export const STATUSES = ['Новичок', 'Старатель', 'Геолог', 'Шахтёр', 'Исследователь', 'Космопроходец', 'Мастер Жеод', 'Хранитель', 'Легенда'];

// ---------- СОСТОЯНИЕ ПО УМОЛЧАНИЮ ----------
export const DEFAULT_STATE = {
    expeditions: {
        mine: { active: false, endTime: null },
        jungle: { active: false, endTime: null },
        asteroid: { active: false, endTime: null }
    },
    geodes: {
        mine: 2,
        jungle: 1,
        asteroid: 0,
        special_mine: 0,
        special_jungle: 0,
        special_asteroid: 0
    },
    ingots: {},
    discoveredSpecialGeodes: {
        mine: false,
        jungle: false,
        asteroid: false
    },
    collectedArtifacts: {
        mine: [],
        jungle: [],
        asteroid: []
    },
    minedStats: {},
    player: {
        level: 1,
        xp: 0,
        totalOpened: 0,
        totalIngots: 0,
        totalArtifacts: 0
    }
};