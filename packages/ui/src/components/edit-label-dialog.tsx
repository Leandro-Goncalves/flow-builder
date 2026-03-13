import { createFormHook } from "@tanstack/react-form";
import { z } from "zod";
import { fieldContext, formContext } from "../context/createFormHookContexts";
import { basicFieldComponents } from "../fieldComponents";
import { usePromiseDialog } from "../hooks/usePromiseDialog";
import { Button } from "./button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";

const { useAppForm } = createFormHook({
  fieldComponents: {
    ...basicFieldComponents(),
  },
  formComponents: {},
  fieldContext,
  formContext,
});

const editLabelSchema = z.object({
  label: z.string().min(1, "Label is required"),
});

interface EditLabelDialogProps {
  open: boolean;
  onClose: () => void;
  onEdit: (newLabel: string) => void;
  label: string;
}

export const EditLabelDialog: React.FC<EditLabelDialogProps> = ({
  open,
  onClose,
  onEdit,
  label,
}) => {
  const form = useAppForm({
    defaultValues: {
      label,
    },
    validators: {
      onChange: editLabelSchema,
    },

    onSubmit: async ({ value }) => {
      onEdit(value.label);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Change node label</DialogTitle>
          <DialogDescription className="sr-only">
            Make changes to your node label here. Click save when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.AppField
            name="label"
            children={(field) => <field.TextField label="label" />}
          />

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit}>
                  {isSubmitting ? "Saving..." : "Save changes"}
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const useEditLabelDialog = () =>
  usePromiseDialog(EditLabelDialog, {
    openKey: "open",
    onCloseKey: "onClose",
    onSuccessKey: "onEdit",
    data: "label",
  });
