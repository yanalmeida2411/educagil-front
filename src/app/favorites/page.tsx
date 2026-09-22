import { redirect } from 'next/navigation';

/** Favoritos vivem como uma aba de "Meus cursos"; a rota curta continua válida. */
export default function FavoritesPage() {
  redirect('/my-courses?filter=favorites');
}
