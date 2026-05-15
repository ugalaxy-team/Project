import apiClient from "../client";

export interface NewsArticleBackend {
  id: number;
  title: string;
  excerpt: string;
  body: string;
  is_important: boolean;
  category_name: string;
  created_at: string;
  updated_at: string;
  read_time: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  categoryColor: string;
  date: string;
  readTime: string;
}

const categoryStyles: Record<
  string,
  { display_name: string; categoryColor: string }
> = {
  updates: {
    display_name: "Оновлення",
    categoryColor: "bg-purple-100 text-purple-700",
  },
  volunteering: {
    display_name: "Волонтерство",
    categoryColor: "bg-green-100 text-green-700",
  },
  tournaments: {
    display_name: "Турніри",
    categoryColor: "bg-blue-100 text-blue-700",
  },
  community: {
    display_name: "Спільнота",
    categoryColor: "bg-orange-100 text-orange-700",
  },
  education: {
    display_name: "Освіта",
    categoryColor: "bg-cyan-100 text-cyan-700",
  },
  fanfic: {
    display_name: "Фанфіки",
    categoryColor: "bg-pink-100 text-pink-700",
  },
};

export const getNews = async (): Promise<NewsArticle[]> => {
  const response = await apiClient.get<NewsArticleBackend[]>("/news/");
  return response.data.map((item) => {
    const category =
      categoryStyles[item.category_name] || categoryStyles.updates;
    return {
      id: String(item.id),
      title: item.title,
      excerpt: item.excerpt,
      content: item.body,
      category: category.display_name,
      categoryColor: category.categoryColor,
      date: new Date(item.created_at).toLocaleDateString("uk-UA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      readTime: item.read_time,
    };
  });
};
