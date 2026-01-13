export const onboardingSteps = [
  {
    element: '[data-onb="home-header"]',
    popover: {
      title: "Головна",
      description: "Тут швидкі дії та віджети. Погнали по ключових блоках.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-onb="home-ai-chat"]',
    popover: {
      title: "AI-чат",
      description:
        "Це твій головний інструмент. Питай про бізнес, документи, клієнтів, інвойси, акти.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-onb="card-organization"]',
    popover: {
      title: "Профіль бізнесу",
      description:
        "Заповни профіль — асистент буде давати точніші відповіді та генерувати правильні документи.",
      side: "right",
      align: "center",
    },
  },
  // {
  //   element: '[data-onb="btn-organization"]',
  //   popover: {
  //     title: "Перейти в профіль",
  //     description: "Натисни, щоб створити/доповнити/переглянути профіль.",
  //     side: "bottom",
  //     align: "center",
  //   },
  // },
  {
    element: '[data-onb="card-documents"]',
    popover: {
      title: "Документи",
      description:
        "Завантаж договори, регламенти, файли — AI буде знати контекст бізнесу.",
      side: "right",
      align: "center",
    },
  },
  // {
  //   element: '[data-onb="btn-upload-doc"]',
  //   popover: {
  //     title: "Завантажити документ",
  //     description: "Це швидкий вхід у базу знань.",
  //     side: "bottom",
  //     align: "center",
  //   },
  // },
  {
    element: '[data-onb="card-clients-finance"]',
    popover: {
      title: "Клієнти та фінанси",
      description:
        "Тут короткі входи у ключові бізнес-розділи: клієнти, комерційні пропозиції, інвойси, акти, аналітика.",
      side: "left",
      align: "center",
    },
  },
  // {
  //   element: '[data-onb="btn-clients"]',
  //   popover: {
  //     title: "Клієнти",
  //     description:
  //       "Додай клієнтів — далі інвойси/акти/пропозиції підтягуються легко.",
  //     side: "bottom",
  //     align: "center",
  //   },
  // },
  // {
  //   element: '[data-onb="btn-invoices"]',
  //   popover: {
  //     title: "Інвойси",
  //     description: "Створюй рахунки, генеруй PDF, керуй статусами.",
  //     side: "bottom",
  //     align: "center",
  //   },
  // },
  // {
  //   element: '[data-onb="btn-acts"]',
  //   popover: {
  //     title: "Акти",
  //     description: "Фіксуй виконані роботи й тримай документи в порядку.",
  //     side: "bottom",
  //     align: "center",
  //   },
  // },
  // {
  //   element: '[data-onb="btn-analytics"]',
  //   popover: {
  //     title: "Аналітика",
  //     description: "Фінансова картина — отримано/очікується/прострочено.",
  //     side: "bottom",
  //     align: "center",
  //   },
  // },
  {
    element: '[data-onb="card-todo"]',
    popover: {
      title: "Задачі на сьогодні",
      description:
        "Планувальник задач. Звідси можна швидко перейти у todo і все організувати.",
      side: "left",
      align: "center",
    },
  },
  // {
  //   element: '[data-onb="btn-todo"]',
  //   popover: {
  //     title: "Відкрити планувальник",
  //     description: "Переходь і додавай перші задачі.",
  //     side: "top",
  //     align: "center",
  //   },
  // },
  {
    element: '[data-onb="card-ai-plan"]',
    popover: {
      title: "AI-план дня",
      description:
        "Коли є задачі — AI згенерує структурований план і збереже на день.",
      side: "left",
      align: "center",
    },
  },
  // {
  //   element: '[data-onb="btn-generate-plan"]',
  //   popover: {
  //     title: "Згенерувати план",
  //     description: "Кнопка активна, коли є задачі й план ще не створений.",
  //     side: "top",
  //     align: "center",
  //   },
  // },
  {
    element: '[data-onb="card-popular"]',
    popover: {
      title: "Популярні задачі",
      description:
        "Шаблони-запити, які можна швидко перетворити в діалог/задачу.",
      side: "left",
      align: "center",
    },
  },
  {
    element: '[data-onb="card-plan"]',
    popover: {
      title: "План",
      description: "Тут план/ліміти. Можна апгрейдитись.",
      side: "left",
      align: "center",
    },
  },
];
