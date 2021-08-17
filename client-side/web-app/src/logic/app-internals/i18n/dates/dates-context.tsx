import { Locale } from 'date-fns';
import enUSDateFnsLocale from 'date-fns/locale/en-US';
import React, { ReactNode, useContext } from 'react';
import {
  TransportedData,
  TransportedDataStatus,
} from '../../transports/transported-data/transported-data-types';

type DatesContextData = {
  dateFnsLocale: TransportedData<Locale>;
};

const DatesContext = React.createContext<null | DatesContextData>(null);

type DatesProviderProps = {
  children: ReactNode;
};

export function useDatesContext() {
  const datesContext = useContext(DatesContext);

  if (!datesContext) {
    throw new Error();
  }

  return datesContext;
}

export const DatesContextProvider = ({ children }: DatesProviderProps) => {
  return (
    <DatesContext.Provider
      value={{
        dateFnsLocale: {
          status: TransportedDataStatus.Done,
          data: enUSDateFnsLocale,
        },
      }}
    >
      {children}
    </DatesContext.Provider>
  );
};
