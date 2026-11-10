export interface CastMember {
  name: string;
  character: string;
  avatar: string;
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  rating: number;
  duration: number;
  likes: number;
  genres: string[];
  poster: string;
  screenshots: string[];
  summary?: string;
  cast?: CastMember[];
  trailerCode?: string;
}

export const AVATARS = [
  '/assets/aistudio/0ecb0264ed6bae405d7a1f06d2b702842000ca23_69821f5d.png',
  '/assets/aistudio/8ada4b5e9db6fa638fd610ae56566f29347fa6cc_e57e8e09.png',
  '/assets/aistudio/9efa2883c85d008343fb6de73f1c7d828598c10b_0a9d3b92.png',
  '/assets/aistudio/22b644fc9582b0f4009d71c4fba3af8de2d76fa5_64f27a3a.png',
  '/assets/aistudio/76e0002b86723433e7e92b593252d92865c77fe2_00b2ea04.png',
  '/assets/aistudio/26200766c8c2f003179d12c5221ee05a7b84c7ef_18107191.png',
  '/assets/aistudio/72248670caa99b64a8fe19db3b62d70ebc10f1dc_e27c0dfe.png',
  '/assets/aistudio/9634d5f2c8b153c8df68558ef338ba799147bc12_d719da93.png',
];

export const MOVIES: Movie[] = [
  {
    id: '1917',
    title: '1917',
    year: 2019,
    rating: 7.7,
    duration: 119,
    likes: 42,
    genres: ['War', 'Drama', 'Action'],
    poster: '/assets/aistudio/1917_-_Sam_Mendes_-_Hollywood_War_Film_Classic_English_Movie_Poster_9ef86295-4756-4c71-bb4e-20745c5fbc1a_1_6e58b4d9.png',
    screenshots: [
      '/assets/aistudio/large-screenshot1_1e399328.png',
      '/assets/aistudio/large-screenshot2_ce84e18c.png',
      '/assets/aistudio/large-screenshot3_306d6dc5.png',
    ],
  },
  {
    id: 'doctor-strange',
    title: 'Doctor Strange in the Multiverse of Madness',
    year: 2022,
    rating: 7.6,
    duration: 90,
    likes: 15,
    genres: ['Action', 'Fantasy', 'Adventure'],
    poster: '/assets/aistudio/b5f1175a7c201f41e00d36644eaff1923c50b99f_08265889.jpg',
    screenshots: [
      '/assets/aistudio/large-screenshot1_1e399328.png',
      '/assets/aistudio/large-screenshot2_ce84e18c.png',
      '/assets/aistudio/large-screenshot3_306d6dc5.png',
    ],
  },
  {
    id: 'avengers',
    title: 'The Avengers',
    year: 2012,
    rating: 7.7,
    duration: 143,
    likes: 88,
    genres: ['Action', 'Sci-Fi'],
    poster: '/assets/aistudio/Group_17_097191e1.png',
    screenshots: [
      '/assets/aistudio/large-screenshot1_1e399328.png',
      '/assets/aistudio/large-screenshot2_ce84e18c.png',
    ],
  },
  {
    id: 'captain-america',
    title: 'Captain America: The First Avenger',
    year: 2011,
    rating: 7.7,
    duration: 124,
    likes: 54,
    genres: ['Action', 'Adventure'],
    poster: '/assets/aistudio/Group_25_6b10fb38.png',
    screenshots: [
      '/assets/aistudio/large-screenshot2_ce84e18c.png',
      '/assets/aistudio/large-screenshot3_306d6dc5.png',
    ],
  },
  {
    id: 'endgame',
    title: 'Avengers: Endgame',
    year: 2019,
    rating: 7.7,
    duration: 181,
    likes: 120,
    genres: ['Action', 'Sci-Fi', 'Drama'],
    poster: '/assets/aistudio/Group_26_5c30e4bc.png',
    screenshots: [
      '/assets/aistudio/large-screenshot1_1e399328.png',
      '/assets/aistudio/large-screenshot3_306d6dc5.png',
    ],
  },
  {
    id: 'civil-war',
    title: 'Captain America: Civil War',
    year: 2016,
    rating: 7.7,
    duration: 147,
    likes: 76,
    genres: ['Action', 'Thriller'],
    poster: '/assets/aistudio/Group_27_7d85fea1.png',
    screenshots: [
      '/assets/aistudio/large-screenshot2_ce84e18c.png',
    ],
  },
  {
    id: 'black-widow',
    title: 'Black Widow',
    year: 2021,
    rating: 7.1,
    duration: 134,
    likes: 33,
    genres: ['Action', 'Spy'],
    poster: '/assets/aistudio/5f51f696241415.5eb2d19f8b3e1_1_c4d97ac6.png',
    screenshots: [
      '/assets/aistudio/large-screenshot1_1e399328.png',
    ],
  },
  {
    id: 'iron-man-3',
    title: 'Iron Man 3',
    year: 2013,
    rating: 7.2,
    duration: 130,
    likes: 61,
    genres: ['Action', 'Sci-Fi'],
    poster: '/assets/aistudio/c0f290d047153021cd9d2c2f4f3a6cebc0fb62b7_f9f9d53b.jpg',
    screenshots: [
      '/assets/aistudio/large-screenshot3_306d6dc5.png',
    ],
  },
  {
    id: 'godzilla',
    title: 'Godzilla: King of the Monsters',
    year: 2019,
    rating: 6.9,
    duration: 132,
    likes: 29,
    genres: ['Action', 'Monster', 'Sci-Fi'],
    poster: '/assets/aistudio/4a254f17dde787053a77faceee0072956dcded22_78c12d1c.jpg',
    screenshots: [
      '/assets/aistudio/large-screenshot2_ce84e18c.png',
    ],
  },
  {
    id: 'wednesday',
    title: 'Wednesday',
    year: 2022,
    rating: 8.1,
    duration: 50,
    likes: 95,
    genres: ['Mystery', 'Fantasy', 'Comedy'],
    poster: '/assets/aistudio/bc77125aec13b4bc2bd9d1bfd3b8677f66864d1a_15f2860b.jpg',
    screenshots: [
      '/assets/aistudio/large-screenshot1_1e399328.png',
    ],
  },
  {
    id: 'doctor-who',
    title: 'Doctor Who: The Day of the Doctor',
    year: 2013,
    rating: 8.4,
    duration: 77,
    likes: 47,
    genres: ['Sci-Fi', 'Adventure'],
    poster: '/assets/aistudio/0fe2c40b8b8b084cd943470d3df2af7b040e8f9b_85e799dd.jpg',
    screenshots: [
      '/assets/aistudio/large-screenshot3_306d6dc5.png',
    ],
  },
];
