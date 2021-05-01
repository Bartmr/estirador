import { Locale } from 'date-fns';
import enUSDateFnsLocale from 'date-fns/locale/en-US';
import React, { ReactNode, useContext } from 'react';

type DatesContextData = {
  dateFnsLocale?: Locale;
};

const DatesContext = React.createContext<null | DatesContextData>(null);

type DatesProviderProps = {
  children: ReactNode;
};

export function useDatesContext() {
  const value = useContext(DatesContext);

  if (!value) {
    throw new Error();
  }

  return {
    dateFnsLocale: value.dateFnsLocale,
  };
}

export const DatesContextProvider = ({ children }: DatesProviderProps) => {
  return (
    <DatesContext.Provider value={{ dateFnsLocale: enUSDateFnsLocale }}>
      {children}
    </DatesContext.Provider>
  );
};
