import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Skeleton } from "primereact/skeleton";
import { InputText } from "primereact/inputtext";
import React, { useContext, useEffect, useRef, useState } from "react";

import { convertDate } from "../../utils/convertStringFunctions";
import { useConfPage } from "../../hooks/custom-hooks/useConfPage";
import { formTypes } from "../../pages/configurations";

import { TabMenu } from "primereact/tabmenu";
import { FilterMatchMode } from "primereact/api";
import { Menu } from "primereact/menu";
import { Tooltip } from "primereact/tooltip";
import { Toast } from "primereact/toast";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { AppController } from "../../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";
import { ConfFormContext } from "../../hooks/useContext-hooks/conf-form-hook/conf-form-hook";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";

interface IConfigurationPageProps {
  setContent: () => void;
  showForm: (formType: formTypes) => void;
  setEditMode: (result: any) => void;
  setVarianceEditMode: (props: any) => void;
}

export type configurationFileTypes = "Storage" | "Optimizer" | "Variance";

export const ConfigurationPage = ({
  setContent,
  showForm,
  setEditMode,
  setVarianceEditMode,
}: IConfigurationPageProps) => {
  const toast = useRef(null);
  const {
    data,
    isLoading,
    deleteConfigHandler,
    uploadConfigHandler,
    getConfigByIdHandler,
    downloadToLocalFolder,
    duplicateFile,
  } = useConfPage(setEditMode, setVarianceEditMode, toast);
  const configurationTabMenuItems: { label: configurationFileTypes }[] = [
    { label: "Storage" },
    { label: "Optimizer" },
    { label: "Variance" },
  ];
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const createMenu = useRef(null);
  const uploadMenu = useRef(null);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const confFormCtx = useContext(ConfFormContext);
  const activeIndex = confFormCtx.confTabIndex;
  const formType =
    activeIndex === 0
      ? "Storage"
      : activeIndex === 1
      ? "Optimizer"
      : activeIndex === 2
      ? "Variance"
      : "Other";

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    path: "",
    type: "Storage",
  });
  const [selectedTabData, setSelectedTabData] = useState([]);
  const router = useRouter();
  const controller = React.useContext(AppController);
  const createMenuItems = [
    {
      label: "Type ",
      items: [
        {
          label: "Storage",
          icon: "pi pi-database",
          command: () => showForm("simulator"),
        },
        {
          label: "Optimizer",
          icon: "pi pi-sliders-h",
          command: () => showForm("optimizer"),
        },
        {
          label: "Variance",
          icon: "pi pi-chart-line",
          command: () => setContent(),
        },
      ],
    },
  ];

  const uploadMenuItems = [
    {
      label: "Type ",
      items: [
        {
          label: "Storage",
          icon: "pi pi-database",
          command: () => uploadConfigHandler("Storage"),
        },
        {
          label: "Optimizer",
          icon: "pi pi-sliders-h",
          command: () => uploadConfigHandler("Optimizer"),
        },
        {
          label: "Variance",
          icon: "pi pi-chart-line",
          command: () => uploadConfigHandler("Variance"),
        },
      ],
    },
  ];

  const confirm = (event, row) => {
    confirmPopup({
      target: event.currentTarget,
      message: `Do you want to delete configuration ${row.name}?`,
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      accept: () => accept(row),
    });
  };

  const accept = (row) => {
    deleteConfigHandler(row);
  };

  useEffect(() => {
    if (controller.javaPath === "" && controller.mode === "Local") {
      if (controller.appLoaded === true)
        Swal.fire({
          title: "Local mode is set without simulator installed",
          text: "Please configure the simulator in preferences",
          icon: "warning",
          showCancelButton: true,
          cancelButtonText: "Cancel",
          confirmButtonText: "Configure",
          reverseButtons: true,

          color: document.documentElement.className.includes("dark")
            ? "white"
            : "",
          background: document.documentElement.className.includes("dark")
            ? "#1f2937"
            : "",
        }).then((result) => {
          if (result.isConfirmed) {
            router.push("/preferences");
          }
        });
    } else if (
      controller.mode === "Online" &&
      controller.onlineServer.address === ""
    ) {
      Swal.fire({
        title: "Online mode is set without a server selected",
        text: "Please configure the server to use in preferences",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Configure",
        reverseButtons: true,

        color: document.documentElement.className.includes("dark")
          ? "white"
          : "",
        background: document.documentElement.className.includes("dark")
          ? "#1f2937"
          : "",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/preferences");
        }
      });
    }
  }, []);

  const actionsTemplate = (rowData) => {
    return (
      <div className="flex justify-between">
        <Button
          icon="pi pi-eye"
          severity="info"
          text
          tooltip="View in read-only mode"
          onClick={() => getConfigByIdHandler(rowData, activeIndex, true)}
        />
        <Button
          icon="pi pi-pencil"
          severity="help"
          text
          tooltip="Edit"
          onClick={() => getConfigByIdHandler(rowData, activeIndex, false)}
        />
        <Tooltip target=".download-button" content="Download" position="left" />
        <Button
          icon="pi pi-download"
          severity="secondary"
          className="download-button"
          text
          onClick={() => downloadToLocalFolder(rowData)}
        />
        <Tooltip
          target=".duplicate-button"
          content="Duplicate configuration"
          position="left"
        />
        <Button
          icon="pi pi-copy"
          severity="warning"
          className="duplicate-button"
          text
          onClick={() => handleDuplicateDialog(rowData)}
        />
        <Tooltip target=".delete-button" content="Delete" position="left" />
        <Button
          icon="pi pi-trash"
          severity="danger"
          className="delete-button"
          text
          onClick={(e) => confirm(e, rowData)}
        />
      </div>
    );
  };

  const skeletonTemplate = () => {
    return <Skeleton></Skeleton>;
  };

  const handleDuplicateDialog = (rowData) => {
    setFormData((prev) => {
      return { ...prev, path: rowData.path };
    });
    setShowDialog(true);
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  useEffect(() => {
    if (activeIndex === 0) {
      setSelectedTabData(data.filter((item) => item.type === "Storage"));
    } else if (activeIndex === 1) {
      setSelectedTabData(data.filter((item) => item.type === "Optimizer"));
    } else if (activeIndex === 2) {
      setSelectedTabData(data.filter((item) => item.type === "Variance"));
    }
  }, [data, activeIndex]);

  if (isLoading) {
    return (
      <>
        <div className="flex nowrap justify-between mt-5 mb-5">
          <h1 className="text-3xl font-bold">Configurations</h1>
          <Menu
            model={createMenuItems}
            popup
            ref={createMenu}
            id="create_menu"
          />
          <Menu
            model={uploadMenuItems}
            popup
            ref={uploadMenu}
            id="upload_menu"
          />
        </div>
        <div className="flex justify-between">
          <TabMenu
            model={configurationTabMenuItems}
            activeIndex={activeIndex}
            onTabChange={(e) => confFormCtx.handleConfTabIndex(e.index)}
          />
          <div>
            <div className="inline-flex space-x-4 mr-5 mb-2">
              <Tooltip target=".create-config" position="top" />
              <span className="create-config">
                <Button
                  label="Create"
                  icon="pi pi-plus"
                  onClick={(event) => createMenu.current.toggle(event)}
                  disabled={
                    (controller.mode === "Local" &&
                      controller.javaPath === "") ||
                    (controller.mode === "Online" &&
                      controller.onlineServer.address === "")
                  }
                  tooltip={
                    controller.mode === "Local" && controller.javaPath === ""
                      ? "Please configure the simulator in preferences"
                      : controller.mode === "Online" &&
                        controller.onlineServer.address === ""
                      ? "Please configure the server to use in preferences"
                      : "Create Configuration"
                  }
                  tooltipOptions={{ showOnDisabled: true }}
                />
              </span>
              <Tooltip target=".upload-config" position="top" />
              <span className="upload-config">
                <Button
                  label="Upload"
                  icon="pi pi-plus"
                  onClick={(event) => uploadMenu.current.toggle(event)}
                  disabled={
                    (controller.mode === "Local" &&
                      controller.javaPath === "") ||
                    (controller.mode === "Online" &&
                      controller.onlineServer.address === "")
                  }
                  tooltip={
                    controller.mode === "Local" && controller.javaPath === ""
                      ? "Please configure the simulator in preferences"
                      : controller.mode === "Online" &&
                        controller.onlineServer.address === ""
                      ? "Please configure the server to use in preferences"
                      : "Upload Configuration"
                  }
                  tooltipOptions={{ showOnDisabled: true }}
                />
              </span>
            </div>
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Keyword Search"
            />
          </div>
        </div>
        <Toast ref={toast} />
        <DataTable value={[]} showGridlines size="small">
          <Column
            field="name"
            style={{ width: "20%" }}
            header="Name"
            body={skeletonTemplate}
          />
          <Column
            field="description"
            style={{ width: "20%" }}
            header="Description"
            body={skeletonTemplate}
          />
          <Column
            field="date"
            header="Date"
            style={{ width: "20%" }}
            body={skeletonTemplate}
          />
          <Column
            header="Action"
            style={{ width: "20%" }}
            body={skeletonTemplate}
          />
        </DataTable>
      </>
    );
  }

  const handleDuplication = () => {
    duplicateFile(formData, formType);
    setFormData({ name: "", description: "", path: "", type: formType });
    setShowDialog(false);
  };

  const footerContent: React.JSX.Element = (
    <Button
      severity="secondary"
      onClick={handleDuplication}
      disabled={formData.name.length === 0}
    >
      Create duplicate
    </Button>
  );

  return (
    <>
      <div className="flex nowrap justify-between mt-5 mb-5">
        <h1 className="text-3xl font-bold">Configurations</h1>
        <Menu model={createMenuItems} popup ref={createMenu} id="create_menu" />
        <Menu model={uploadMenuItems} popup ref={uploadMenu} id="upload_menu" />
      </div>

      <div className="flex justify-center">
        <div className="w-full">
          <div className="flex justify-between">
            <TabMenu
              model={configurationTabMenuItems}
              activeIndex={activeIndex}
              onTabChange={(e) => confFormCtx.handleConfTabIndex(e.index)}
            />
            <div>
              <div className="inline-flex space-x-4 mr-5 mb-2">
                <Tooltip target=".create-config" position="top" />
                <span className="create-config">
                  <Button
                    label="Create"
                    icon="pi pi-plus"
                    onClick={(event) => createMenu.current.toggle(event)}
                    disabled={
                      (controller.mode === "Local" &&
                        controller.javaPath === "") ||
                      (controller.mode === "Online" &&
                        controller.onlineServer.address === "")
                    }
                    tooltip={
                      controller.mode === "Local" && controller.javaPath === ""
                        ? "Please configure the simulator in preferences"
                        : controller.mode === "Online" &&
                          controller.onlineServer.address === ""
                        ? "Please configure the server to use in preferences"
                        : "Create Configuration"
                    }
                    tooltipOptions={{ showOnDisabled: true }}
                  />
                </span>
                <Tooltip target=".upload-config" position="top" />
                <span className="upload-config">
                  <Button
                    label="Upload"
                    icon="pi pi-plus"
                    onClick={(event) => uploadMenu.current.toggle(event)}
                    disabled={
                      (controller.mode === "Local" &&
                        controller.javaPath === "") ||
                      (controller.mode === "Online" &&
                        controller.onlineServer.address === "")
                    }
                    tooltip={
                      controller.mode === "Local" && controller.javaPath === ""
                        ? "Please configure the simulator in preferences"
                        : controller.mode === "Online" &&
                          controller.onlineServer.address === ""
                        ? "Please configure the server to use in preferences"
                        : "Upload Configuration"
                    }
                    tooltipOptions={{ showOnDisabled: true }}
                  />
                </span>
              </div>
              <InputText
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
                placeholder="Keyword Search"
              />
            </div>
          </div>
          <DataTable
            value={selectedTabData}
            filters={filters}
            removableSort
            sortOrder={-1}
            paginator
            rows={10}
            rowsPerPageOptions={[10, 25, 50]}
            size="small"
            globalFilterFields={["name", "description", "date", "dateModified"]}
            emptyMessage="No configuration files found, try creating one with the buttons at the top."
            showGridlines
          >
            <Column
              headerStyle={{ fontWeight: "bold" }}
              field="id"
              filterField="id"
              style={{ width: "15%" }}
              header="ID"
              sortable
              hidden
            />
            <Column
              headerStyle={{ fontWeight: "bold" }}
              field="name"
              filterField="name"
              style={{ width: "15%" }}
              header="Name"
              sortable
            />
            <Column
              headerStyle={{ fontWeight: "bold" }}
              field="description"
              filterField="description"
              style={{ width: "30%" }}
              header="Description"
              sortable
            />
            <Column
              headerStyle={{ fontWeight: "bold" }}
              field="date"
              filterField="date"
              header="Date Created"
              style={{ width: "10%" }}
              body={convertDate}
              sortable
            />
            <Column
              headerStyle={{ fontWeight: "bold" }}
              field="dateModified"
              filterField="dateModified"
              style={{ width: "10%" }}
              header="Date Last Modified"
              body={convertDate}
              sortable
            />
            <Column
              headerStyle={{ fontWeight: "bold" }}
              header="Action"
              style={{ width: "20%" }}
              body={actionsTemplate}
            />
          </DataTable>
        </div>
        <Toast ref={toast} />
        <ConfirmPopup />
        <Dialog
          onHide={() => setShowDialog(false)}
          visible={showDialog}
          header="Configuration duplication form"
          footer={footerContent}
          id="save-config-dialog"
          style={{ width: "50vw", height: "30vw" }}
        >
          <div className="flex flex-col mt-5 space-y-2">
            <label>Enter a name for the configuration file</label>
            <InputText
              onChange={(event) =>
                setFormData((prev) => {
                  return { ...prev, name: event.target.value };
                })
              }
              value={formData.name}
            />
          </div>
          <div className="flex flex-col mt-5 space-y-2">
            <label>Enter a short description</label>
            <InputTextarea
              onChange={(event) =>
                setFormData((prev) => {
                  return { ...prev, description: event.target.value };
                })
              }
              value={formData.description}
            />
          </div>
          <br />
        </Dialog>
      </div>
    </>
  );
};
