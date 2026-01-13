import type { OnboardingTask } from "./types";

export const onboardingTasks: OnboardingTask[] = [
  {
    id: "organization",
    title: "Заповнити профіль організації",
    description: "Дані бізнесу — база для якісних відповідей AI та документів.",
    href: "/organization",
    target: "nav-organization",
  },
  {
    id: "documents",
    title: "Завантажити документи",
    description:
      "Додай договори/рахунки/політики — AI зможе відповідати точніше.",
    href: "/knowledge-base",
    target: "nav-knowledge-base",
  },
  {
    id: "ai",
    title: "Поставити запитання AI",
    description: "Спробуй: “підготуй лист клієнту про оплату інвойсу”.",
    href: "/chat",
    target: "nav-chat",
  },
  {
    id: "clients",
    title: "Додати першого клієнта",
    description: "Клієнти — основа актів, інвойсів, комерційних пропозицій.",
    href: "/clients",
    target: "nav-clients",
  },
  {
    id: "invoices",
    title: "Створити інвойс",
    description: "Згенеруй інвойс і протестуй PDF/статуси.",
    href: "/invoices",
    target: "nav-invoices",
  },
  {
    id: "acts",
    title: "Створити акт",
    description: "Підпиши роботу актом, зручно для обліку.",
    href: "/acts",
    target: "nav-acts",
  },
  {
    id: "quotes",
    title: "Зробити комерційну пропозицію",
    description: "Швидко збери пропозицію і відправ клієнту.",
    href: "/quotes",
    target: "nav-quotes",
  },
  {
    id: "analytics",
    title: "Переглянути аналітику",
    description: "Подивись фінанси, динаміку та статуси оплат.",
    href: "/analytics",
    target: "nav-analytics",
  },
];
