import { useCallback, useState } from 'react';

const useToggle = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const toggle = useCallback(() => setIsOpen(state => !state), []);

  return [isOpen, toggle];
};

export default useToggle;
