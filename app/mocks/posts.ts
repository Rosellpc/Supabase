export interface Post {
  id: number | string;
  user_id?: string;
  user?: {
    username: string;
    avatar: string;
  };
  image_url: string;
  caption: string;
  likes: number;
  isLiked?: boolean;
  created_at: string | Date;
  updated_at?: string | Date;
}

// Lista unificada de posts para home y ranking
export const posts: Post[] = [
  {
    id: 1,
    user: { username: "sofia_photo", avatar: "https://i.pravatar.cc/150?img=5" },
    image_url: "https://picsum.photos/seed/rank1/600/600",
    caption: "Atardecer en la playa, momentos que valen oro",
    likes: 1250,
    isLiked: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 2,
    user: { username: "diego_travel", avatar: "https://i.pravatar.cc/150?img=8" },
    image_url: "https://picsum.photos/seed/rank2/600/600",
    caption: "Explorando nuevos lugares cada dia",
    likes: 980,
    isLiked: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8),
  },
  {
    id: 3,
    user: { username: "maria_dev", avatar: "https://i.pravatar.cc/150?img=1" },
    image_url: "https://picsum.photos/seed/rank3/600/600",
    caption: "Codigo y cafe, la combinacion perfecta",
    likes: 875,
    isLiked: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 4,
    user: { username: "carlos_code", avatar: "https://i.pravatar.cc/150?img=2" },
    image_url: "https://picsum.photos/seed/rank4/600/600",
    caption: "Nuevo proyecto terminado!",
    likes: 654,
    isLiked: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  {
    id: 5,
    user: { username: "ana_tech", avatar: "https://i.pravatar.cc/150?img=3" },
    image_url: "https://picsum.photos/seed/rank5/600/600",
    caption: "Aprendiendo algo nuevo cada dia",
    likes: 543,
    isLiked: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
  {
    id: 6,
    user: { username: "luis_design", avatar: "https://i.pravatar.cc/150?img=12" },
    image_url: "https://picsum.photos/seed/rank6/600/600",
    caption: "El diseno esta en los detalles",
    likes: 421,
    isLiked: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
  },
  {
    id: 7,
    user: { username: "paula_art", avatar: "https://i.pravatar.cc/150?img=9" },
    image_url: "https://picsum.photos/seed/rank7/600/600",
    caption: "Arte digital, mi nueva pasion",
    likes: 389,
    isLiked: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  },
  {
    id: 8,
    user: { username: "jorge_music", avatar: "https://i.pravatar.cc/150?img=11" },
    image_url: "https://picsum.photos/seed/rank8/600/600",
    caption: "La musica es vida",
    likes: 256,
    isLiked: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
  },
  {
    id: 9,
    user: { username: "elena_food", avatar: "https://i.pravatar.cc/150?img=10" },
    image_url: "https://picsum.photos/seed/rank9/600/600",
    caption: "Receta del dia: pasta casera",
    likes: 128,
    isLiked: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  },
];
