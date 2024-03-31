import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

interface DialogDeleteTraceProps {
    deleteDialogVisible: boolean;
    setDeleteDialogVisible: any;
    deleteTrace: any;
    submitDeleteTrace: any;
}

export default function DialogDeleteTrace({deleteDialogVisible,
  setDeleteDialogVisible,
  deleteTrace,
  submitDeleteTrace,
}: DialogDeleteTraceProps) {
  return (
    <Dialog
      header="Delete Trace?"
      style={{ height: "25%", width: "20%" }}
      visible={deleteDialogVisible}
      onHide={() => setDeleteDialogVisible(false)}
    >
      <div className="flex flex-col pt-2 h-full justify-around">
        <span className="p-float-label mt-2">
          Are you sure you want to delete "{deleteTrace.name}"?
        </span>
        <div className="flex nowrap justify-between">
          <Button
            label="Cancel"
            icon="pi pi-times"
            className="p-button-text"
            onClick={() => setDeleteDialogVisible(false)}
          />
          <Button
            className="p-button-danger"
            label="Delete"
            icon="pi pi-trash"
            onClick={() => submitDeleteTrace()}
          />
        </div>
      </div>
    </Dialog>
  );
}
