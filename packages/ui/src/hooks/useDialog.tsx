import React, { useCallback, useState } from "react";

interface dialogDataProps<D> {
  isOpen: boolean;
  data?: D;
}

interface CustomKeys<P, DKey> {
  openKey: keyof P;
  onCloseKey: keyof P;
  data?: DKey;
}

export interface Controls<DValue> {
  open: (args: DValue extends undefined ? void : DValue) => void;
}

export const useDialog = <
  COMPONENT extends React.FC<any>,
  PROPS extends React.ComponentProps<COMPONENT>,
  DATA_KEY_VALUE extends PROPS[DATA_KEY] extends never ? void : PROPS[DATA_KEY],
  DATA_KEY extends keyof PROPS = never,
>(
  Component: COMPONENT,
  keys: CustomKeys<PROPS, DATA_KEY>,
  options?: {
    unmountOnClose?: boolean;
  },
): [() => React.ReactNode, Controls<DATA_KEY_VALUE>, boolean] => {
  const [dialogData, setDialogData] = useState<
    dialogDataProps<DATA_KEY_VALUE extends undefined ? void : DATA_KEY_VALUE>
  >({
    isOpen: false,
  });

  const handleClose = useCallback(() => {
    setDialogData({ isOpen: false });
  }, []);

  const handleOpen = (
    data: DATA_KEY_VALUE extends undefined ? void : DATA_KEY_VALUE,
  ) => {
    setDialogData({ isOpen: true, data });
  };

  const controls: Controls<DATA_KEY_VALUE> = {
    open: handleOpen,
  };

  const internalComponentMemo = React.useCallback(() => {
    if (!dialogData.isOpen && options?.unmountOnClose) return <></>;

    const ComponentProps = {
      [keys.openKey]: dialogData.isOpen,
      [keys.onCloseKey]: handleClose,
      ...(keys.data && { [keys.data]: dialogData.data }),
    };

    return Component(ComponentProps);
  }, [
    Component,
    dialogData.data,
    dialogData.isOpen,
    handleClose,
    keys.data,
    keys.openKey,
    keys.onCloseKey,
    options?.unmountOnClose,
  ]);

  return [internalComponentMemo as any, controls, dialogData.isOpen];
};
