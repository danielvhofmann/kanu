import { useState } from "react";

interface CollectionItem {
  id: string;
  name: string;
}

export const useGraphHistory = () => {
  const [collection, setCollection] = useState<CollectionItem[]>([]);

  const addToCollection = (id: string, name: string) => {
    setCollection(prev => {
      if (prev.some(item => item.id === id)) return prev;
      return [...prev, { id, name }];
    });
  };

  const removeFromCollection = (id: string) => {
    setCollection(prev => prev.filter(item => item.id !== id));
  };

  const isInCollection = (id: string) => {
    return collection.some(item => item.id === id);
  };

  return {
    collection,
    addToCollection,
    removeFromCollection,
    isInCollection
  };
};
