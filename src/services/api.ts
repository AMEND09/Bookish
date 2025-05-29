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

// Update the getBookDetails function to handle author extraction properly
export const getBookDetails = async (bookKey: string): Promise<Book | null> => {
  try {
    // Remove the /works/ prefix if it exists
    const key = bookKey.replace('/works/', '');
    const response = await fetch(`${BASE_URL}/works/${key}.json`);
    const data = await response.json();
    
    // Try to get page count from editions if not available in work data
    let pageCount = data.number_of_pages_median;
    
    if (!pageCount && data.editions) {
      pageCount = await getPageCountFromEditions(data.editions);
    }
    
    // If still no page count, try to get from first edition
    if (!pageCount) {
      pageCount = await getPageCountFromFirstEdition(key);
    }
    
    // Extract author names properly
    let authorNames: string[] = [];
    if (data.authors && data.authors.length > 0) {
      // Fetch author details to get names
      const authorPromises = data.authors.slice(0, 3).map(async (author: any) => {
        try {
          const authorResponse = await fetch(`${BASE_URL}${author.author.key}.json`);
          const authorData = await authorResponse.json();
          return authorData.name;
        } catch (error) {
          return null;
        }
      });
      
      const resolvedAuthors = await Promise.all(authorPromises);
      authorNames = resolvedAuthors.filter(name => name !== null);
    }
    
    return {
      key: data.key,
      title: data.title,
      author_name: authorNames,
      cover_i: data.covers?.[0],
      first_publish_year: data.first_publish_year,
      description: data.description?.value || data.description || '',
      number_of_pages_median: pageCount
    };
  } catch (error) {
    console.error('Error fetching book details:', error);
    return null;
  }
};

// New helper function to get page count from editions
const getPageCountFromEditions = async (editions: any): Promise<number | undefined> => {
  try {
    if (!editions || !editions.entries || editions.entries.length === 0) {
      return undefined;
    }

    // Try to get page counts from first few editions
    for (const edition of editions.entries.slice(0, 3)) {
      try {
        const editionResponse = await fetch(`${BASE_URL}${edition.key}.json`);
        const editionData = await editionResponse.json();
        
        if (editionData.number_of_pages) {
          return editionData.number_of_pages;
        }
      } catch (error) {
        console.error('Error fetching edition:', error);
        continue;
      }
    }
    
    return undefined;
  } catch (error) {
    console.error('Error getting page count from editions:', error);
    return undefined;
  }
};

// New helper function to get page count from first edition of a work
const getPageCountFromFirstEdition = async (workKey: string): Promise<number | undefined> => {
  try {
    const editionsResponse = await fetch(`${BASE_URL}/works/${workKey}/editions.json?limit=5`);
    const editionsData = await editionsResponse.json();
    
    if (editionsData.entries && editionsData.entries.length > 0) {
      // Look for editions with page counts
      for (const edition of editionsData.entries) {
        if (edition.number_of_pages) {
          return edition.number_of_pages;
        }
      }
    }
    
    return undefined;
  } catch (error) {
    console.error('Error fetching editions for page count:', error);
    return undefined;
  }
};

// New function to estimate page count based on book characteristics
export const estimatePageCount = (book: Book): number => {
  // Default estimates based on book type and publication year
  const currentYear = new Date().getFullYear();
  const publishYear = book.first_publish_year || currentYear;
  
  // Rough estimates - can be refined based on genre, etc.
  if (publishYear < 1900) {
    return 320; // Classic literature tends to be longer
  } else if (publishYear < 1950) {
    return 280;
  } else if (publishYear < 2000) {
    return 250;
  } else {
    return 220; // Modern books tend to be shorter on average
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