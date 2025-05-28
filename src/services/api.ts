import { Book } from '../types';

const BASE_URL = 'https://openlibrary.org';

export const searchBooks = async (query: string): Promise<Book[]> => {
  try {
    const response = await fetch(`${BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=10`);
    const data = await response.json();
    return data.docs.map((book: any) => ({
      key: book.key,
      title: book.title,
      author_name: book.author_name,
      cover_i: book.cover_i,
      first_publish_year: book.first_publish_year,
      number_of_pages_median: book.number_of_pages_median
    }));
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
};

export const getBookDetails = async (bookKey: string): Promise<Book | null> => {
  try {
    // Remove the /works/ prefix if it exists
    const key = bookKey.replace('/works/', '');
    const response = await fetch(`${BASE_URL}/works/${key}.json`);
    const data = await response.json();
    
    return {
      key: data.key,
      title: data.title,
      author_name: data.authors?.map((author: any) => author.name) || [],
      cover_i: data.covers?.[0],
      first_publish_year: data.first_publish_year,
      description: data.description?.value || data.description || '',
      number_of_pages_median: data.number_of_pages_median
    };
  } catch (error) {
    console.error('Error fetching book details:', error);
    return null;
  }
};

export const getBookCoverUrl = (coverId: number, size: 'S' | 'M' | 'L' = 'M'): string => {
  if (!coverId) return '/placeholder-cover.jpg';
  
  const sizeMap = {
    S: 'small',
    M: 'medium',
    L: 'large'
  };
  
  return `https://covers.openlibrary.org/b/id/${coverId}-${sizeMap[size]}.jpg`;
};

export const searchBooksBySubject = async (subject: string): Promise<Book[]> => {
  try {
    const response = await fetch(`${BASE_URL}/subjects/${encodeURIComponent(subject.toLowerCase())}.json?limit=10`);
    const data = await response.json();
    return data.works?.map((book: any) => ({
      key: book.key,
      title: book.title,
      author_name: book.authors?.map((author: any) => author.name) || [],
      cover_i: book.cover_id,
      first_publish_year: book.first_publish_year,
      number_of_pages_median: book.number_of_pages_median
    })) || [];
  } catch (error) {
    console.error('Error searching books by subject:', error);
    return [];
  }
};

export const searchBookByISBN = async (isbn: string): Promise<Book | null> => {
  try {
    const cleanISBN = isbn.replace(/[-\s]/g, '');
    const response = await fetch(`${BASE_URL}/isbn/${cleanISBN}.json`);
    if (!response.ok) return null;
    
    const data = await response.json();
    return {
      key: data.key,
      title: data.title,
      author_name: data.authors?.map((author: any) => author.name) || [],
      cover_i: data.covers?.[0],
      first_publish_year: data.publish_date ? new Date(data.publish_date).getFullYear() : undefined,
      number_of_pages_median: data.number_of_pages
    };
  } catch (error) {
    console.error('Error searching book by ISBN:', error);
    return null;
  }
};