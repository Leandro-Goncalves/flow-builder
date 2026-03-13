import React, { useCallback, useRef, useState } from "react";

interface dialogDataProps<D> {
  isOpen: boolean;
  data?: D;
}

interface CustomKeys<P, DKey, SUCCESSKey> {
  openKey: keyof P;
  onCloseKey: keyof P;
  onSuccessKey: SUCCESSKey;
  data?: DKey;
}

export interface Controls<DValue, SUCCESSValue> {
  open: (
    args: DValue extends undefined ? void : DValue,
  ) => Promise<SUCCESSValue>;
}

export const usePromiseDialog = <
  COMPONENT extends React.FC<any>,
  PROPS extends React.ComponentProps<COMPONENT>,
  SUCCESS extends keyof PROPS,
  SUCCESS_VALUE extends Parameters<PROPS[SUCCESS]>[0],
  DATA_KEY_VALUE extends PROPS[DATA_KEY] extends never ? void : PROPS[DATA_KEY],
  DATA_KEY extends keyof PROPS = never,
>(
  Component: COMPONENT,
  keys: CustomKeys<PROPS, DATA_KEY, SUCCESS>,
): [() => React.ReactNode, Controls<DATA_KEY_VALUE, SUCCESS_VALUE>] => {
  const successPromiseRef = useRef<(value: SUCCESS_VALUE) => void | null>(null);
  const rejectPromiseRef = useRef<() => void | null>(null);
  const [dialogData, setDialogData] = useState<
    dialogDataProps<DATA_KEY_VALUE extends undefined ? void : DATA_KEY_VALUE>
  >({
    isOpen: false,
  });

  const handleSuccess = useCallback((data: SUCCESS_VALUE) => {
    setDialogData({ isOpen: false });
    if (successPromiseRef.current) {
      successPromiseRef.current(data);
    }
  }, []);

  const handleReject = useCallback(() => {
    setDialogData({ isOpen: false });

    if (rejectPromiseRef.current) {
      rejectPromiseRef.current();
    }
  }, []);

  const handleOpen = async (
    data: DATA_KEY_VALUE extends undefined ? void : DATA_KEY_VALUE,
  ): Promise<SUCCESS_VALUE> => {
    if (data) {
      setDialogData({ isOpen: true, data });
    } else {
      setDialogData({ isOpen: true });
    }
    return new Promise<SUCCESS_VALUE>((resolve, reject) => {
      successPromiseRef.current = resolve;
      rejectPromiseRef.current = reject;
    });
  };

  const controls: Controls<DATA_KEY_VALUE, SUCCESS_VALUE> = {
    open: handleOpen,
  };

  const internalComponentMemo = React.useCallback(() => {
    if (!dialogData.isOpen) return <></>;

    const ComponentProps = {
      [keys.openKey]: dialogData.isOpen,
      [keys.onCloseKey]: handleReject,
      [keys.onSuccessKey]: handleSuccess,
      ...(keys.data && { [keys.data]: dialogData.data }),
    };

    return Component(ComponentProps);
  }, [
    Component,
    dialogData.data,
    dialogData.isOpen,
    handleReject,
    handleSuccess,
    keys.data,
    keys.onCloseKey,
    keys.onSuccessKey,
    keys.openKey,
  ]);

  return [internalComponentMemo as any, controls];
};
